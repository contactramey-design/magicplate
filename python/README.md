# Python (Optional) — Quick Scrape + Resend Test

This repo is primarily Node-based, but this folder lets you run a **simple Python test** using:
- `googlemaps` (Places Text Search)
- `resend-python` (send email)
- `python-dotenv`

## Install

From the repo root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r python/requirements.txt
```

## Configure `.env`

Make sure these exist in your repo `.env`:

```bash
GOOGLE_PLACES_API_KEY=...
RESEND_API_KEY=...
FROM_EMAIL=sydney@magicplate.info
FROM_NAME=Sydney - MagicPlate
```

Optional:

```bash
PY_SCRAPE_QUERY="restaurants, Manhattan, NY, USA"
PY_SCRAPE_LIMIT=3
PY_NOTIFY_EMAIL="you@yourdomain.com"
```

## Run

```bash
python python/main.py
```

## Outreach script (Google Places → real emails only → Resend)

This script **does not guess emails** (to protect deliverability). It only emails addresses it finds publicly on the restaurant website.

### Configure `.env`

```bash
GOOGLE_PLACES_API_KEY=...
RESEND_API_KEY=...
FROM_EMAIL=you@magicplate.info
FROM_NAME="Sydney - MagicPlate"

# LA defaults (optional)
SEARCH_LAT=34.0522
SEARCH_LNG=-118.2437
SEARCH_RADIUS_METERS=10000

# Low presence filters (optional)
MAX_REVIEWS=15
MAX_PHOTOS=6
REQUIRE_WEBSITE=true

# Sending limits (optional)
DAILY_SEND_CAP=10
SEND_DELAY_SECONDS=12
LEADS_OUT_DIR=data
```

### Dry run (recommended first)

```bash
python python/restaurant_outreach.py --dry-run
```

### Send (after you confirm filters + sender)

```bash
python python/restaurant_outreach.py --send
```


