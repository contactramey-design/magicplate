import os
import json
from datetime import datetime

from dotenv import load_dotenv


def require_env(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing env var: {name}")
    return v


def scrape_google_maps(query: str, limit: int = 10):
    """
    Uses Google Places Text Search via googlemaps client.
    NOTE: For production-scale scraping/lead gen, respect API terms and quotas.
    """
    import googlemaps

    api_key = require_env("GOOGLE_PLACES_API_KEY")
    gmaps = googlemaps.Client(key=api_key)

    results = []
    page_token = None

    while len(results) < limit:
        resp = gmaps.places(query=query, page_token=page_token)
        for r in resp.get("results", []):
            results.append(
                {
                    "name": r.get("name"),
                    "address": r.get("formatted_address"),
                    "rating": r.get("rating"),
                    "place_id": r.get("place_id"),
                    "scraped_at": datetime.utcnow().isoformat() + "Z",
                }
            )
            if len(results) >= limit:
                break

        page_token = resp.get("next_page_token")
        if not page_token:
            break

    return results


def send_resend_email(to_email: str, subject: str, text: str):
    """
    Sends an email via Resend.
    Requires RESEND_API_KEY and FROM_EMAIL in env.
    """
    import resend

    resend.api_key = require_env("RESEND_API_KEY")
    from_email = require_env("FROM_EMAIL")

    # Resend expects "From Name <email@domain>"
    from_name = os.getenv("FROM_NAME", "MagicPlate")
    from_field = f"{from_name} <{from_email}>"

    return resend.Emails.send(
        {
            "from": from_field,
            "to": to_email,
            "subject": subject,
            "text": text,
        }
    )


def main():
    load_dotenv()  # loads ../.env if you run from repo root

    query = os.getenv("PY_SCRAPE_QUERY", "restaurants, Manhattan, NY, USA")
    limit = int(os.getenv("PY_SCRAPE_LIMIT", "3"))

    print(f"Scraping Google Maps: query={query!r} limit={limit}")
    leads = scrape_google_maps(query=query, limit=limit)
    print(json.dumps(leads, indent=2))

    # Optional: send yourself a test email with results
    notify = os.getenv("PY_NOTIFY_EMAIL")
    if notify:
        subject = "MagicPlate Python scrape test"
        text = "Leads:\n\n" + "\n".join(
            f"- {l.get('name')} — {l.get('address')}" for l in leads
        )
        print(f"Sending Resend email to {notify} ...")
        resp = send_resend_email(to_email=notify, subject=subject, text=text)
        print("Resend response:", resp)


if __name__ == "__main__":
    main()

