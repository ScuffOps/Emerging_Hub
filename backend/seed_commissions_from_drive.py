"""One-off seeding script: upload finished commission pieces from a local folder
to Emergent Object Storage and create Commission DB entries. Public visibility.

Run:  cd /app/backend && python seed_commissions_from_drive.py
"""
import os
import sys
import uuid
import re
import mimetypes
from pathlib import Path
from datetime import datetime, timezone

from dotenv import load_dotenv
import requests
from pymongo import MongoClient

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

SRC = Path("/tmp/drivepull/🙟FOR ARTISTS🙜༉ུ‧₊˚")
STORAGE_URL = os.environ.get("STORAGE_URL", "https://integrations.emergentagent.com/objstore/api/v1/storage")
EMERGENT_KEY = os.environ["EMERGENT_LLM_KEY"]
APP_NAME = os.environ.get("APP_NAME", "veri-vtuber-portfolio")

# Init storage
resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
resp.raise_for_status()
storage_key = resp.json()["storage_key"]

mongo = MongoClient(os.environ["MONGO_URL"])
db = mongo[os.environ["DB_NAME"]]

# Skip assets that aren't finished commissioned artworks
SKIP_PATTERNS = [
    r"^1 detailed ref",
    r"^2\.0 ",
    r"^Ankle Ink",
    r"^blue eye",
    r"^Rose Earring",
    r"^Tail Ring",
    r"^TENKO SEAL",
    r"^VERI 2\.0 BRAND",
    r"^Veri Cross",
    r"^Veri Viking EDITS",
    r"^Lore pt\.I",
    r"^new link",
    r"^Seal Inner",
    r"\.mp4$",
    r"\.psd$",
    r"\.clip$",
    r"^Copy of  ?2\.0 Model",
    r"^Copy of VERI 2\.0 ANNOUNCEMENT",
    r"^Copy of Current Model",
    r"^Mochi Alice BG",
    r"^Mochi Alice\.png$",   # keep only trans
    r"^Eye Geas REWORK",      # reference rework
]
SKIP_RE = re.compile("|".join(SKIP_PATTERNS), re.I)

# Filename → (artist_name, title)
# When the artist is embedded in the filename, pull it. Otherwise artist = "Unknown".
def parse(name: str):
    stem = Path(name).stem
    # Drop leading "Copy of "
    stem = re.sub(r"^Copy of\s+", "", stem, flags=re.I)
    # Drop trailing markers
    stem = re.sub(r"\b(FIN|FINAL|SMALL|trans|REDO|COOL|update|fin|copy|SAT|news)\b", "", stem, flags=re.I)
    stem = re.sub(r"\s+", " ", stem).strip(" -._")
    low = stem.lower()

    # Known artist embeddings
    known = [
        ("BenikoArt",     "Eye Banner",            r"benikoart"),
        ("OreoLemon",     "Elegance",              r"oreolemon"),
        ("EOFproject",    "EOF Project",           r"eofproject"),
        ("HelenCreth",    "Geas",                  r"helencreth"),
        ("Kilinxx",       "Hope's Light",          r"kilinxx"),
        ("Maya",          "Maya Piece",            r"^maya\b|\bmaya\b"),
        ("Muribundo",     "Muribundo Piece",       r"muribundo"),
        ("Hiko",          "Reach Out",             r"hiko"),
        ("Usagi",         "Usagi Piece",           r"usagi"),
        ("Augi",          "Veri Augi",             r"augi"),
        ("shann04",       "Veri Reading",          r"shann04"),
        ("RexSama",       "Veri RexSama",          r"rexsama"),
        ("Dolce",         "Dolce Piece",           r"dolce"),
        ("Mochi Alice",   "Mochi Alice",           r"mochi alice"),
        ("Anarts",        "Anarts Piece",          r"^anarts\b"),
        ("Vesmir",        "Vesmir Piece",          r"^vesmir"),
        ("Yuuneii",       "Luxury",                r"yuuneii"),
        ("SAT",           "Splash Screen",         r"splash screen sat"),
    ]
    for artist, title_fallback, pat in known:
        if re.search(pat, low):
            return artist, (re.sub(pat, "", stem, flags=re.I).strip(" -_·:") or title_fallback)

    # No embedded artist; use cleaned title, artist unknown
    return "Unknown Artist", stem or "Veri Commission"


def upload(path: Path) -> str:
    data = path.read_bytes()
    ext = path.suffix.lstrip(".").lower() or "png"
    key_path = f"{APP_NAME}/commissions/{uuid.uuid4()}.{ext}"
    content_type = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    r = requests.put(
        f"{STORAGE_URL}/objects/{key_path}",
        headers={"X-Storage-Key": storage_key, "Content-Type": content_type},
        data=data,
        timeout=180,
    )
    r.raise_for_status()
    info = r.json()
    # Store FileRecord so /api/files/{path} serves it.
    db.files.insert_one({
        "id": str(uuid.uuid4()),
        "storage_path": info["path"],
        "original_filename": path.name,
        "content_type": content_type,
        "size": info.get("size", len(data)),
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return f"/api/files/{info['path']}"


def main():
    if not SRC.exists():
        print(f"Source folder not found: {SRC}")
        sys.exit(1)

    # Wipe previous imported batch so re-runs are idempotent.
    db.commissions.delete_many({"imported_from": "drive_artistrefboard"})

    inserted = 0
    skipped = 0
    files = sorted([p for p in SRC.iterdir() if p.is_file()])
    for f in files:
        if SKIP_RE.search(f.name):
            skipped += 1
            continue
        artist, title = parse(f.name)
        try:
            url = upload(f)
        except Exception as e:
            print(f"  ! upload failed for {f.name}: {e}")
            continue
        doc = {
            "id": str(uuid.uuid4()),
            "title": title,
            "description": "",
            "artist": {
                "name": artist,
                "discord": None, "twitter": None, "vgen": None, "portfolio": None,
            },
            "platform": "",
            "type": "",
            "status": "Completed",
            "payment_status": "paid",
            "budget": 0,
            "currency": "USD",
            "payments": [],
            "deadline": None,
            "finished_date": None,
            "usage_rights": "personal",
            "visibility": "public",
            "reference_urls": [],
            "final_urls": [url],
            "notes": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "is_deleted": False,
            "imported_from": "drive_artistrefboard",
        }
        db.commissions.insert_one(doc)
        print(f"  ✓ {artist:<16} — {title}  ({f.name})")
        inserted += 1

    print(f"\nDone. Inserted {inserted}, skipped {skipped}.")
    mongo.close()


if __name__ == "__main__":
    main()
