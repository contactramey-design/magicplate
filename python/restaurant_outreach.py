"""
restaurant_outreach.py

MVP outreach pipeline (ethical + deliverability-safe):
1) Google Places Nearby Search (geo radius) for restaurants
2) Place Details: pull website + reviews + photos count
3) "Low online presence" filter (configurable)
4) Extract REAL emails from the restaurant website/contact pages (no guessing)
5) Save leads to CSV/JSON + send intro emails via Resend with daily caps + throttling

Run:
  python python/restaurant_outreach.py --dry-run
  python python/restaurant_outreach.py --send

Env needed:
  GOOGLE_PLACES_API_KEY=...
  RESEND_API_KEY=...
  FROM_EMAIL=you@magicplate.info
  FROM_NAME="Sydney - MagicPlate"

Optional env:
  SEARCH_LAT=34.0522
  SEARCH_LNG=-118.2437
  SEARCH_RADIUS_METERS=10000
  MAX_REVIEWS=15
  MAX_PHOTOS=6
  REQUIRE_WEBSITE=true
  DAILY_SEND_CAP=10
  SEND_DELAY_SECONDS=12
  LEADS_OUT_DIR=data
"""

from __future__ import annotations

import argparse
import csv
import os
import re
import time
import json
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
from typing import Dict, List, Optional, Set, Tuple
from urllib.parse import urljoin, urlparse

import requests
from dotenv import load_dotenv


EMAIL_RE = re.compile(r"([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})")


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def env_bool(name: str, default: bool) -> bool:
    v = os.getenv(name)
    if v is None:
        return default
    return v.strip().lower() in {"1", "true", "yes", "y", "on"}


def env_int(name: str, default: int) -> int:
    v = os.getenv(name)
    if not v:
        return default
    try:
        return int(v)
    except ValueError:
        return default


def env_float(name: str, default: float) -> float:
    v = os.getenv(name)
    if not v:
        return default
    try:
        return float(v)
    except ValueError:
        return default


def require_env(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing env var: {name}")
    return v


def normalize_email(email: str) -> str:
    return email.strip().lower()


def is_public_contact_email(email: str) -> bool:
    e = email.lower()
    banned = [
        "noreply",
        "no-reply",
        "donotreply",
        "privacy@",
        "abuse@",
        "support@",
        "billing@",
        "postmaster@",
        "webmaster@",
    ]
    return not any(b in e for b in banned)


def is_valid_email_syntax(email: str) -> bool:
    return bool(re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email))


def safe_get(url: str, timeout: int = 8) -> Optional[str]:
    try:
        r = requests.get(
            url,
            timeout=timeout,
            headers={
                "User-Agent": "Mozilla/5.0 (MagicPlate Outreach; +https://magicplate.info)",
                "Accept": "text/html,application/xhtml+xml",
            },
        )
        if r.status_code >= 400:
            return None
        return r.text
    except requests.RequestException:
        return None


def extract_emails_from_html(html: str) -> List[str]:
    if not html:
        return []
    found = EMAIL_RE.findall(html)
    cleaned = []
    for e in found:
        e2 = normalize_email(e)
        if is_valid_email_syntax(e2) and is_public_contact_email(e2):
            cleaned.append(e2)
    # preserve order, dedupe
    out: List[str] = []
    seen: Set[str] = set()
    for e in cleaned:
        if e not in seen:
            out.append(e)
            seen.add(e)
    return out


def extract_candidate_links(base_url: str, html: str) -> List[str]:
    """
    Minimal href extraction (no BeautifulSoup dependency).
    We only need obvious pages likely to contain an email.
    """
    if not html:
        return []
    hrefs = re.findall(r'href=[\'"]([^\'"]+)[\'"]', html, flags=re.IGNORECASE)
    keywords = ("contact", "about", "menu", "reserv", "cater", "connect")
    urls: List[str] = []
    for href in hrefs:
        h = href.strip()
        if not h or h.startswith("#"):
            continue
        if h.lower().startswith("mailto:"):
            continue
        if any(k in h.lower() for k in keywords):
            urls.append(urljoin(base_url, h))
    # add common direct paths
    for p in ("/contact", "/contact-us", "/about", "/about-us", "/catering"):
        urls.append(urljoin(base_url, p))
    # dedupe + same host only
    base_host = urlparse(base_url).netloc
    out: List[str] = []
    seen: Set[str] = set()
    for u in urls:
        try:
            host = urlparse(u).netloc
        except Exception:
            continue
        if host and base_host and host != base_host:
            continue
        if u not in seen:
            out.append(u)
            seen.add(u)
    return out[:10]


def find_public_emails(website: str) -> List[str]:
    """
    Strategy:
      1) Fetch homepage -> extract emails
      2) Fetch a few likely pages -> extract emails
    """
    if not website:
        return []
    # normalize URL
    if not website.startswith(("http://", "https://")):
        website = "https://" + website

    home_html = safe_get(website)
    emails = extract_emails_from_html(home_html or "")
    if emails:
        return emails

    # Try candidate links
    for link in extract_candidate_links(website, home_html or ""):
        html = safe_get(link)
        emails2 = extract_emails_from_html(html or "")
        if emails2:
            return emails2

    return []


@dataclass
class Lead:
    place_id: str
    name: str
    address: str
    website: Optional[str]
    rating: Optional[float]
    user_ratings_total: int
    photos_count: int
    emails: List[str]
    scraped_at: str
    status: str  # new / emailed / skipped


def places_nearby_all(gmaps, lat: float, lng: float, radius_m: int, keyword: str = "restaurant") -> List[Dict]:
    """
    Google Places Nearby search, paginated.
    """
    results: List[Dict] = []
    resp = gmaps.places_nearby(location=(lat, lng), radius=radius_m, keyword=keyword, type="restaurant")
    results.extend(resp.get("results", []))

    while resp.get("next_page_token"):
        time.sleep(2.2)  # required for next page token activation
        resp = gmaps.places_nearby(pagetoken=resp["next_page_token"])
        results.extend(resp.get("results", []))

    return results


def get_place_details(gmaps, place_id: str) -> Dict:
    fields = ["name", "formatted_address", "website", "rating", "user_ratings_total", "photos", "place_id"]
    resp = gmaps.place(place_id=place_id, fields=fields)
    return resp.get("result", {})


def is_low_presence(details: Dict, max_reviews: int, max_photos: int, require_website: bool) -> bool:
    reviews = int(details.get("user_ratings_total") or 0)
    photos_count = len(details.get("photos") or [])
    website = details.get("website")

    if reviews > max_reviews:
        return False
    if photos_count > max_photos:
        return False
    if require_website and not website:
        return False
    return True


def resend_send(to_email: str, subject: str, html: str, text: str) -> str:
    import resend

    resend.api_key = require_env("RESEND_API_KEY")
    from_email = require_env("FROM_EMAIL")
    from_name = os.getenv("FROM_NAME", "Sydney - MagicPlate")

    resp = resend.Emails.send(
        {
            "from": f"{from_name} <{from_email}>",
            "to": [to_email],
            "subject": subject,
            "html": html,
            "text": text,
        }
    )
    # resp is a dict with id
    return str(resp.get("id") or "")


def render_intro_email(lead: Lead) -> Tuple[str, str, str]:
    city = lead.address.split(",")[0] if lead.address else ""
    subject = f"Quick question about {lead.name} ({city})"
    unsubscribe = 'To opt out, reply with "stop".'
    html = f"""
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <p>Hi {lead.name} team,</p>
      <p>I’m Sydney with <strong>MagicPlate</strong>. I found your restaurant and noticed you have a lighter online presence (few photos/reviews).</p>
      <p>We help indie restaurants make their <strong>real menu photos</strong> look amazing and turn them into a clean <strong>digital menu link</strong> (QR-ready) so customers order more.</p>
      <p>If you’d like, reply with <strong>2–3 menu item photos</strong> and I’ll send a <strong>free sample enhancement</strong> so you can see the quality.</p>
      <p>Best,<br/>Sydney<br/>MagicPlate<br/><a href="https://magicplate.info">magicplate.info</a></p>
      <p style="color:#666;font-size:12px;margin-top:14px;">{unsubscribe}</p>
    </div>
    """
    text = (
        f"Hi {lead.name} team,\n\n"
        "I’m Sydney with MagicPlate. I noticed you have a lighter online presence (few photos/reviews).\n\n"
        "We help indie restaurants enhance real menu photos + turn them into a QR-ready digital menu link.\n\n"
        "Reply with 2–3 menu item photos and I’ll send a free sample enhancement.\n\n"
        "Best,\nSydney\nMagicPlate\nmagicplate.info\n\n"
        f"{unsubscribe}\n"
    )
    return subject, html, text


def load_state(out_dir: str) -> Dict:
    path = os.path.join(out_dir, "outreach_state.json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"emailed": {}, "last_run": None}


def save_state(out_dir: str, state: Dict) -> None:
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, "outreach_state.json")
    with open(path, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def save_csv(out_path: str, leads: List[Lead]) -> None:
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(
            f,
            fieldnames=[
                "place_id",
                "name",
                "address",
                "website",
                "rating",
                "user_ratings_total",
                "photos_count",
                "emails",
                "scraped_at",
                "status",
            ],
        )
        w.writeheader()
        for lead in leads:
            row = asdict(lead)
            row["emails"] = ";".join(lead.emails)
            w.writerow(row)


def save_json(out_path: str, leads: List[Lead]) -> None:
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump([asdict(l) for l in leads], f, indent=2)


def main():
    load_dotenv()

    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="Scrape + export only (no emails)")
    parser.add_argument("--send", action="store_true", help="Send outreach emails (respects caps)")
    args = parser.parse_args()

    if not args.dry_run and not args.send:
        args.dry_run = True

    import googlemaps

    gmaps = googlemaps.Client(key=require_env("GOOGLE_PLACES_API_KEY"))

    lat = env_float("SEARCH_LAT", 34.0522)
    lng = env_float("SEARCH_LNG", -118.2437)
    radius_m = env_int("SEARCH_RADIUS_METERS", 10_000)

    max_reviews = env_int("MAX_REVIEWS", 15)
    max_photos = env_int("MAX_PHOTOS", 6)
    require_website = env_bool("REQUIRE_WEBSITE", True)

    daily_cap = env_int("DAILY_SEND_CAP", 10)
    delay_s = env_int("SEND_DELAY_SECONDS", 12)
    out_dir = os.getenv("LEADS_OUT_DIR", "data")

    print("MagicPlate Outreach (Python)")
    print(f"  Location: {lat},{lng} radius={radius_m}m")
    print(f"  Low presence filter: max_reviews={max_reviews} max_photos={max_photos} require_website={require_website}")
    print(f"  Mode: {'SEND' if args.send else 'DRY-RUN'} cap/day={daily_cap} delay={delay_s}s")

    state = load_state(out_dir)
    emailed = state.get("emailed", {})

    nearby = places_nearby_all(gmaps, lat, lng, radius_m)
    print(f"Found {len(nearby)} places (raw nearby results)")

    leads: List[Lead] = []
    for p in nearby:
        pid = p.get("place_id")
        if not pid:
            continue
        details = get_place_details(gmaps, pid)
        if not details:
            continue

        if not is_low_presence(details, max_reviews=max_reviews, max_photos=max_photos, require_website=require_website):
            continue

        website = details.get("website")
        emails = find_public_emails(website) if website else []

        lead = Lead(
            place_id=str(details.get("place_id") or pid),
            name=str(details.get("name") or ""),
            address=str(details.get("formatted_address") or ""),
            website=website,
            rating=details.get("rating"),
            user_ratings_total=int(details.get("user_ratings_total") or 0),
            photos_count=len(details.get("photos") or []),
            emails=emails,
            scraped_at=now_iso(),
            status="new",
        )

        if not lead.emails:
            lead.status = "skipped"

        leads.append(lead)

    # Deduplicate by place_id
    uniq: Dict[str, Lead] = {}
    for l in leads:
        if l.place_id not in uniq:
            uniq[l.place_id] = l
    leads = list(uniq.values())

    # Export
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    csv_path = os.path.join(out_dir, f"leads-{stamp}.csv")
    json_path = os.path.join(out_dir, f"leads-{stamp}.json")
    save_csv(csv_path, leads)
    save_json(json_path, leads)
    print(f"Exported: {csv_path}")
    print(f"Exported: {json_path}")

    # Sending
    if args.send:
        require_env("RESEND_API_KEY")
        require_env("FROM_EMAIL")

        sent = 0
        for lead in leads:
            if sent >= daily_cap:
                break
            if not lead.emails:
                continue
            if emailed.get(lead.place_id):
                continue

            to_email = lead.emails[0]
            subject, html, text = render_intro_email(lead)
            try:
                msg_id = resend_send(to_email=to_email, subject=subject, html=html, text=text)
                emailed[lead.place_id] = {"email": to_email, "sent_at": now_iso(), "resend_id": msg_id}
                sent += 1
                print(f"✅ Sent {sent}/{daily_cap}: {lead.name} -> {to_email}")
            except Exception as e:
                print(f"❌ Failed: {lead.name} -> {to_email}: {e}")

            time.sleep(delay_s)

        state["emailed"] = emailed
        state["last_run"] = now_iso()
        save_state(out_dir, state)
        print(f"Done. Sent {sent} emails.")
    else:
        print("Dry run complete (no emails sent).")
        print("Tip: run with --send after you verify your filters + FROM_EMAIL.")


if __name__ == "__main__":
    main()

