import os
import logging
import re
from pathlib import Path
import uuid
from datetime import datetime, timezone, timedelta
import tempfile
from typing import Optional
import aiofiles
import shutil
import requests
import jwt

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header, UploadFile, File, Form, Query, Response
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

# Load env variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Setup models
from models import (
    CharacterProfile, GalleryItem, BrandAsset, License, DebutAsset, 
    AuthRequest, AuthResponse, FileRecord, Commission
)

# --- Configuration & Setup ---
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Object Storage Integration ---
STORAGE_URL = os.environ.get('STORAGE_URL', "https://integrations.emergentagent.com/objstore/api/v1/storage")
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = os.environ.get('APP_NAME', "veri-vtuber-portfolio")
storage_key = None

def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    if not EMERGENT_KEY:
        logger.error("EMERGENT_LLM_KEY is not set.")
        return None
    try:
        resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        return storage_key
    except Exception as e:
        logger.error(f"Failed to init storage: {e}")
        return None

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    if not key:
        raise Exception("Storage not initialized")
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple[bytes, str]:
    key = init_storage()
    if not key:
        raise Exception("Storage not initialized")
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

@app.on_event("startup")
async def startup():
    init_storage()

@app.on_event("shutdown")
async def shutdown():
    client.close()

# --- Auth setup ---
JWT_SECRET = os.environ.get('JWT_SECRET', 'veri-secret-key-2024')
DEBUT_PASSWORD = os.environ.get('DEBUT_PASSWORD', 'veri2024')
ADMIN_EMAILS = [e.strip().lower() for e in (os.environ.get('ADMIN_EMAILS', '') or '').split(',') if e.strip()]
EMERGENT_AUTH_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

def create_token(extra: dict | None = None):
    payload = {"exp": datetime.now(timezone.utc) + timedelta(hours=24)}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    try:
        jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return True


async def _is_admin_email(email: str) -> bool:
    """Email is admin if it's in env allowlist OR in DB admins collection,
    OR (bootstrap) if no admin exists yet — the first signed-in email becomes admin."""
    email_l = (email or "").lower()
    if not email_l:
        return False
    if email_l in ADMIN_EMAILS:
        return True
    existing = await db.admins.find_one({"email": email_l, "is_deleted": {"$ne": True}}, {"_id": 0})
    if existing:
        return True
    # Bootstrap: zero admins anywhere → first comer wins
    if not ADMIN_EMAILS:
        any_admin = await db.admins.count_documents({"is_deleted": {"$ne": True}})
        if any_admin == 0:
            await db.admins.insert_one({
                "email": email_l,
                "added_at": datetime.now(timezone.utc).isoformat(),
                "bootstrap": True,
                "is_deleted": False,
            })
            return True
    return False


# --- Routes ---
@api_router.get("/")
async def root():
    return {"message": "API Running"}

# Authentication
@api_router.post("/auth/verify-debut", response_model=AuthResponse)
async def verify_debut(auth: AuthRequest):
    if auth.password == DEBUT_PASSWORD:
        return AuthResponse(token=create_token())
    raise HTTPException(status_code=401, detail="Invalid password")


@api_router.post("/auth/google/session")
async def auth_google_session(payload: dict):
    """Exchange an Emergent Auth session_id for an admin JWT.

    Body: { session_id: string }
    """
    session_id = (payload or {}).get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    try:
        r = requests.get(
            EMERGENT_AUTH_SESSION_URL,
            headers={"X-Session-ID": session_id},
            timeout=15,
        )
        r.raise_for_status()
        data = r.json()
    except requests.HTTPError:
        raise HTTPException(status_code=401, detail="Invalid or expired session_id")
    except Exception as e:
        logger.error(f"Google auth lookup failed: {e}")
        raise HTTPException(status_code=502, detail="Auth provider unreachable")

    email = (data.get("email") or "").lower()
    name = data.get("name") or email
    picture = data.get("picture")

    if not await _is_admin_email(email):
        raise HTTPException(status_code=403, detail=f"{email} is not authorized as admin")

    token = create_token({"email": email, "name": name})
    return {
        "token": token,
        "user": {"email": email, "name": name, "picture": picture},
    }


@api_router.get("/auth/me")
async def auth_me(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    try:
        decoded = jwt.decode(authorization.split(" ")[1], JWT_SECRET, algorithms=["HS256"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {
        "email": decoded.get("email"),
        "name": decoded.get("name"),
        "is_password_session": "email" not in decoded,
    }


@api_router.get("/auth/admins")
async def list_admins(authorized: bool = Depends(verify_token)):
    rows = await db.admins.find({"is_deleted": {"$ne": True}}, {"_id": 0}).to_list(50)
    return {"admins": rows, "env_allowlist": ADMIN_EMAILS}


@api_router.post("/auth/admins")
async def add_admin(payload: dict, authorized: bool = Depends(verify_token)):
    email = (payload.get("email") or "").lower().strip()
    if not email or "@" not in email:
        raise HTTPException(status_code=400, detail="Valid email required")
    existing = await db.admins.find_one({"email": email})
    if existing:
        await db.admins.update_one({"email": email}, {"$set": {"is_deleted": False}})
    else:
        await db.admins.insert_one({
            "email": email,
            "added_at": datetime.now(timezone.utc).isoformat(),
            "is_deleted": False,
        })
    return {"status": "ok", "email": email}


@api_router.delete("/auth/admins/{email}")
async def remove_admin(email: str, authorized: bool = Depends(verify_token)):
    await db.admins.update_one({"email": email.lower()}, {"$set": {"is_deleted": True}})
    return {"status": "removed", "email": email.lower()}


# ---------------- Design (interactive character ref board) ----------------
@api_router.get("/design")
async def list_design_elements():
    """Public: returns all design elements + the canvas (body image) URL."""
    rows = await db.design_elements.find(
        {"is_deleted": {"$ne": True}}, {"_id": 0}
    ).sort("display_order", 1).to_list(200)
    char = await db.characters.find_one({}, {"_id": 0, "fullBody": 1, "avatar": 1, "name": 1})
    return {
        "elements": rows,
        "canvas_url": (char or {}).get("fullBody"),
        "character_name": (char or {}).get("name"),
    }


@api_router.post("/design")
async def create_design_element(payload: dict, authorized: bool = Depends(verify_token)):
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.get("name") or "Untitled element",
        "category": payload.get("category") or "feature",  # tattoo|accessory|mark|motif|feature|outfit
        "description": payload.get("description") or "",
        "thumbnail": payload.get("thumbnail"),
        "full_image": payload.get("full_image") or payload.get("thumbnail"),
        "position_x": float(payload.get("position_x") or 50),  # percentage 0-100
        "position_y": float(payload.get("position_y") or 50),
        "display_order": int(payload.get("display_order") or 0),
        "color": payload.get("color"),  # optional accent color
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "is_deleted": False,
    }
    await db.design_elements.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.put("/design/{element_id}")
async def update_design_element(element_id: str, payload: dict, authorized: bool = Depends(verify_token)):
    set_doc = {k: v for k, v in payload.items() if k in {
        "name", "category", "description", "thumbnail", "full_image",
        "position_x", "position_y", "display_order", "color"
    }}
    if "position_x" in set_doc: set_doc["position_x"] = float(set_doc["position_x"])
    if "position_y" in set_doc: set_doc["position_y"] = float(set_doc["position_y"])
    if "display_order" in set_doc: set_doc["display_order"] = int(set_doc["display_order"])
    set_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    res = await db.design_elements.update_one({"id": element_id}, {"$set": set_doc})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Element not found")
    doc = await db.design_elements.find_one({"id": element_id}, {"_id": 0})
    return doc


@api_router.delete("/design/{element_id}")
async def delete_design_element(element_id: str, authorized: bool = Depends(verify_token)):
    await db.design_elements.update_one({"id": element_id}, {"$set": {"is_deleted": True}})
    return {"status": "deleted"}


# ---------------- Merch (Fourthwall) ----------------
FOURTHWALL_API_KEY = os.environ.get("FOURTHWALL_API_KEY")
FOURTHWALL_BASES = [
    ("https://storefront-api.fourthwall.com/v1/collections/all/products", "storefront_token"),
    ("https://api.fourthwall.com/v1/products", "bearer"),
]
_merch_cache = {"data": None, "expires_at": 0}
_shop_cache = {"public_domain": None, "expires_at": 0}


def _fetch_fourthwall_shop():
    import time
    now = time.time()
    if _shop_cache["public_domain"] and _shop_cache["expires_at"] > now:
        return _shop_cache["public_domain"]
    try:
        r = requests.get(
            "https://storefront-api.fourthwall.com/v1/shop",
            params={"storefront_token": FOURTHWALL_API_KEY},
            headers={"User-Agent": "Mozilla/5.0 VeriVT-Site/1.0", "Accept": "application/json"},
            timeout=10,
        )
        if r.status_code == 200:
            domain = r.json().get("publicDomain")
            _shop_cache["public_domain"] = domain
            _shop_cache["expires_at"] = now + 3600
            return domain
    except Exception as e:
        logger.warning(f"Fourthwall shop lookup failed: {e}")
    return None



@api_router.get("/merch")
async def get_merch():
    """Public proxy for Fourthwall storefront. Caches for 5 minutes."""
    import time
    now = time.time()
    if _merch_cache["data"] and _merch_cache["expires_at"] > now:
        return _merch_cache["data"]
    if not FOURTHWALL_API_KEY:
        return {"products": [], "error": "FOURTHWALL_API_KEY not configured"}
    shop_domain = _fetch_fourthwall_shop()
    last_err = None
    headers_common = {"User-Agent": "Mozilla/5.0 VeriVT-Site/1.0", "Accept": "application/json"}
    for url, auth_type in FOURTHWALL_BASES:
        try:
            if auth_type == "storefront_token":
                r = requests.get(url, params={"storefront_token": FOURTHWALL_API_KEY, "size": 100}, headers=headers_common, timeout=15)
            else:
                r = requests.get(url, headers={**headers_common, "Authorization": f"Bearer {FOURTHWALL_API_KEY}"}, params={"limit": 100}, timeout=15)
            if r.status_code != 200:
                last_err = f"{url} → {r.status_code}: {r.text[:200]}"
                continue
            raw = r.json()
            if isinstance(raw, list):
                results = raw
            else:
                results = raw.get("results") or raw.get("products") or raw.get("items") or []
            products = []
            for p in results if isinstance(results, list) else []:
                variants = p.get("variants") or []
                first_v = variants[0] if variants else {}
                price_obj = (first_v.get("unitPrice") or p.get("unitPrice") or p.get("price") or {})
                images = p.get("images") or first_v.get("images") or []
                if isinstance(images, list) and images:
                    first_img = images[0]
                    img = first_img.get("url") if isinstance(first_img, dict) else first_img
                else:
                    img = None
                products.append({
                    "id": p.get("id") or p.get("slug"),
                    "name": p.get("name") or p.get("title"),
                    "slug": p.get("slug"),
                    "description": p.get("description"),
                    "price": (price_obj.get("value") if isinstance(price_obj, dict) else price_obj),
                    "currency": (price_obj.get("currency") if isinstance(price_obj, dict) else "USD"),
                    "image": img,
                    "url": p.get("url") or (f"https://{shop_domain}/products/{p.get('slug')}" if (shop_domain and p.get('slug')) else None),
                })
            payload = {"products": products, "count": len(products), "shop_url": f"https://{shop_domain}" if shop_domain else None}
            _merch_cache["data"] = payload
            _merch_cache["expires_at"] = now + 300
            return payload
        except Exception as e:
            last_err = str(e)
            continue
    return {"products": [], "error": f"Fourthwall fetch failed: {last_err}"}




# Character Profile
@api_router.get("/character", response_model=CharacterProfile)
async def get_character():
    char = await db.characters.find_one({}, {"_id": 0})
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    return char

@api_router.put("/character", response_model=CharacterProfile)
async def update_character(profile: dict):
    # Upsert logic
    profile_obj = CharacterProfile(**profile)
    await db.characters.replace_one({}, profile_obj.model_dump(), upsert=True)
    return profile_obj

# Gallery
@api_router.get("/gallery", response_model=list[GalleryItem])
async def get_gallery(category: str = None, folder: str = None, limit: int = 100, skip: int = 0):
    query = {"is_deleted": False}
    if category and category != "All":
        query["category"] = category
    if folder:
        query["folder"] = folder
    return await db.gallery.find(query, {"_id": 0}).skip(skip).limit(limit).to_list(limit)

@api_router.post("/gallery", response_model=GalleryItem)
async def create_gallery_item(item: dict):
    item_obj = GalleryItem(**item)
    await db.gallery.insert_one(item_obj.model_dump())
    return item_obj

@api_router.put("/gallery/{id}", response_model=GalleryItem)
async def update_gallery_item(id: str, item: dict):
    item_obj = GalleryItem(**item)
    item_obj.id = id # Preserve ID
    res = await db.gallery.replace_one({"id": id}, item_obj.model_dump())
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return item_obj

@api_router.delete("/gallery/{id}")
async def delete_gallery_item(id: str):
    await db.gallery.update_one({"id": id}, {"$set": {"is_deleted": True}})
    return {"status": "deleted"}

# Brand Assets — admin only
@api_router.get("/brand", response_model=list[BrandAsset])
async def get_brand_assets(limit: int = 100, skip: int = 0, authorized: bool = Depends(verify_token)):
    return await db.brand_assets.find({"is_deleted": False}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)

@api_router.post("/brand", response_model=BrandAsset)
async def create_brand_asset(item: dict, authorized: bool = Depends(verify_token)):
    item_obj = BrandAsset(**item)
    await db.brand_assets.insert_one(item_obj.model_dump())
    return item_obj

@api_router.delete("/brand/{id}")
async def delete_brand_asset(id: str, authorized: bool = Depends(verify_token)):
    await db.brand_assets.update_one({"id": id}, {"$set": {"is_deleted": True}})
    return {"status": "deleted"}

# Licenses — admin only
@api_router.get("/licenses", response_model=list[License])
async def get_licenses(limit: int = 100, skip: int = 0, authorized: bool = Depends(verify_token)):
    return await db.licenses.find({"is_deleted": False}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)

@api_router.post("/licenses", response_model=License)
async def create_license(item: dict, authorized: bool = Depends(verify_token)):
    item_obj = License(**item)
    await db.licenses.insert_one(item_obj.model_dump())
    return item_obj

@api_router.delete("/licenses/{id}")
async def delete_license(id: str, authorized: bool = Depends(verify_token)):
    await db.licenses.update_one({"id": id}, {"$set": {"is_deleted": True}})
    return {"status": "deleted"}

# Commissions
def _optional_auth(authorization: str = Header(None)) -> bool:
    """Returns True if a valid Bearer token is present, False otherwise. Never raises."""
    if not authorization or not authorization.startswith("Bearer "):
        return False
    token = authorization.split(" ", 1)[1]
    try:
        jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return True
    except Exception:
        return False


def _derive_payment_status(budget: float, payments: list) -> str:
    total = sum((p.get("amount") or 0) for p in payments) if payments else 0
    if budget <= 0 and total <= 0:
        return "unpaid"
    if total <= 0:
        return "unpaid"
    if total >= budget:
        return "paid"
    return "partial"


@api_router.get("/commissions", response_model=list[Commission])
async def list_commissions(
    authorized: bool = Depends(verify_token),
    status: Optional[str] = Query(None),
    platform: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    artist: Optional[str] = Query(None),
    usage_rights: Optional[str] = Query(None),
    visibility: Optional[str] = Query(None),
    price_min: Optional[float] = Query(None),
    price_max: Optional[float] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    limit: int = 200,
    skip: int = 0,
):
    query = {"is_deleted": False}
    if visibility:
        query["visibility"] = visibility

    if status:
        query["status"] = status
    if platform:
        query["platform"] = platform
    if type:
        query["type"] = type
    if artist:
        query["artist.name"] = {"$regex": artist, "$options": "i"}
    if usage_rights:
        query["usage_rights"] = usage_rights
    if price_min is not None or price_max is not None:
        rng = {}
        if price_min is not None:
            rng["$gte"] = price_min
        if price_max is not None:
            rng["$lte"] = price_max
        query["budget"] = rng
    if date_from or date_to:
        rng = {}
        if date_from:
            rng["$gte"] = date_from
        if date_to:
            rng["$lte"] = date_to
        query["deadline"] = rng

    return await db.commissions.find(query, {"_id": 0}).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)


@api_router.put("/commissions/bulk-rename-artist")
async def bulk_rename_artist(payload: dict, authorized: bool = Depends(verify_token)):
    """Bulk-update all commissions whose artist.name matches `from_name`.

    Body: { from_name, to_name, twitter?, vgen?, discord?, portfolio? }
    Empty/missing handle fields are ignored (existing values preserved per-commission).
    """
    from_name = (payload.get("from_name") or "").strip()
    to_name = (payload.get("to_name") or "").strip()
    if not from_name or not to_name:
        raise HTTPException(status_code=400, detail="from_name and to_name are required")

    set_doc = {
        "artist.name": to_name,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    for field in ("twitter", "vgen", "discord", "portfolio"):
        val = payload.get(field)
        if val:
            set_doc[f"artist.{field}"] = val

    res = await db.commissions.update_many(
        {"artist.name": from_name, "is_deleted": False},
        {"$set": set_doc},
    )
    return {"matched": res.matched_count, "modified": res.modified_count}



@api_router.post("/commissions", response_model=Commission)
async def create_commission(item: dict, authorized: bool = Depends(verify_token)):
    payments = item.get("payments") or []
    if "payment_status" not in item or not item.get("payment_status"):
        item["payment_status"] = _derive_payment_status(item.get("budget", 0), payments)
    obj = Commission(**item)
    await db.commissions.insert_one(obj.model_dump())
    return obj


@api_router.put("/commissions/{item_id}", response_model=Commission)
async def update_commission(item_id: str, item: dict, authorized: bool = Depends(verify_token)):
    payments = item.get("payments") or []
    if "payment_status" not in item or not item.get("payment_status"):
        item["payment_status"] = _derive_payment_status(item.get("budget", 0), payments)
    obj = Commission(**item)
    obj.id = item_id
    obj.updated_at = datetime.now(timezone.utc).isoformat()
    res = await db.commissions.replace_one({"id": item_id}, obj.model_dump())
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Commission not found")
    return obj


@api_router.delete("/commissions/{item_id}")
async def delete_commission(item_id: str, authorized: bool = Depends(verify_token)):
    await db.commissions.update_one({"id": item_id}, {"$set": {"is_deleted": True}})
    return {"status": "deleted"}


@api_router.get("/commissions/stats")
async def commissions_stats(authorized: bool = Depends(verify_token)):
    query = {"is_deleted": False}
    items = await db.commissions.find(
        query,
        {"_id": 0, "budget": 1, "payments": 1, "status": 1},
    ).to_list(1000)
    total_budget = sum((i.get("budget") or 0) for i in items)
    paid_total = 0
    for i in items:
        paid_total += sum((p.get("amount") or 0) for p in (i.get("payments") or []))
    status_counts = {}
    for i in items:
        s = i.get("status") or "Unknown"
        status_counts[s] = status_counts.get(s, 0) + 1
    return {
        "count": len(items),
        "total_budget": round(total_budget, 2),
        "total_paid": round(paid_total, 2),
        "total_outstanding": round(max(total_budget - paid_total, 0), 2),
        "by_status": status_counts,
    }


@api_router.get("/credits")
async def get_credits():
    """Public: aggregate Completed + public-visibility commissions by artist."""
    cursor = db.commissions.find(
        {"is_deleted": False, "status": "Completed", "visibility": "public"},
        {"_id": 0, "id": 1, "artist": 1, "title": 1, "type": 1, "platform": 1,
         "finished_date": 1, "final_urls": 1, "reference_urls": 1},
    ).sort("finished_date", -1)
    items = await cursor.to_list(1000)

    by_artist = {}
    for c in items:
        artist = c.get("artist") or {}
        name = (artist.get("name") or "").strip()
        if not name:
            continue
        key = name.lower()
        entry = by_artist.setdefault(key, {
            "name": name,
            "discord": artist.get("discord"),
            "twitter": artist.get("twitter"),
            "vgen": artist.get("vgen"),
            "portfolio": artist.get("portfolio"),
            "pieces": [],
            "avatar_url": None,
        })
        thumb = None
        if c.get("final_urls"):
            thumb = c["final_urls"][0]
        elif c.get("reference_urls"):
            thumb = c["reference_urls"][0]
        piece = {
            "id": c.get("id"),
            "title": c.get("title") or "Untitled",
            "type": c.get("type"),
            "platform": c.get("platform"),
            "finished_date": c.get("finished_date"),
            "thumbnail": thumb,
        }
        entry["pieces"].append(piece)
        if not entry["avatar_url"] and thumb:
            entry["avatar_url"] = thumb
        # prefer most complete contact fields if multiple commissions
        for k in ("discord", "twitter", "vgen", "portfolio"):
            if not entry.get(k) and artist.get(k):
                entry[k] = artist.get(k)

    result = sorted(by_artist.values(), key=lambda a: len(a["pieces"]), reverse=True)
    for a in result:
        a["slug"] = _slugify(a["name"])
    return {"artists": result, "total_artists": len(result), "total_pieces": len(items)}


def _slugify(name: str) -> str:
    s = (name or "").lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-") or "artist"


@api_router.get("/credits/{slug}")
async def get_credit_artist(slug: str):
    """Per-artist public deep-link page."""
    cursor = db.commissions.find(
        {"is_deleted": False, "status": "Completed", "visibility": "public"},
        {"_id": 0, "id": 1, "artist": 1, "title": 1, "type": 1, "platform": 1,
         "finished_date": 1, "final_urls": 1, "reference_urls": 1, "description": 1},
    ).sort("finished_date", -1)
    items = await cursor.to_list(1000)

    matching = [c for c in items if _slugify((c.get("artist") or {}).get("name") or "") == slug]
    if not matching:
        raise HTTPException(status_code=404, detail="Artist not found")

    artist = (matching[0].get("artist") or {})
    # collapse to most-complete handle set
    handles = {"discord": None, "twitter": None, "vgen": None, "portfolio": None}
    for c in matching:
        a = c.get("artist") or {}
        for k in handles:
            if not handles[k] and a.get(k):
                handles[k] = a[k]

    pieces = []
    for c in matching:
        thumb = (c.get("final_urls") or [None])[0] or (c.get("reference_urls") or [None])[0]
        pieces.append({
            "id": c.get("id"),
            "title": c.get("title"),
            "type": c.get("type"),
            "platform": c.get("platform"),
            "finished_date": c.get("finished_date"),
            "thumbnail": thumb,
            "image": (c.get("final_urls") or [None])[0] or (c.get("reference_urls") or [None])[0],
            "description": c.get("description"),
        })

    avatar_url = next((p["thumbnail"] for p in pieces if p["thumbnail"]), None)
    return {
        "name": artist.get("name") or "Unknown Artist",
        "slug": slug,
        **handles,
        "pieces": pieces,
        "avatar_url": avatar_url,
        "count": len(pieces),
    }



# Debut Assets
@api_router.get("/debut", response_model=list[DebutAsset])
async def get_debut_assets(authorized: bool = Depends(verify_token), limit: int = 100, skip: int = 0):
    return await db.debut_assets.find({"is_deleted": False}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)

@api_router.post("/debut", response_model=DebutAsset)
async def create_debut_asset(item: dict, authorized: bool = Depends(verify_token)):
    item_obj = DebutAsset(**item)
    await db.debut_assets.insert_one(item_obj.model_dump())
    return item_obj

@api_router.delete("/debut/{id}")
async def delete_debut_asset(id: str, authorized: bool = Depends(verify_token)):
    await db.debut_assets.update_one({"id": id}, {"$set": {"is_deleted": True}})
    return {"status": "deleted"}

# --- Chunked File Uploads ---
UPLOAD_DIR = Path("/tmp/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@api_router.post("/upload/init")
async def upload_init(filename: str = Form(...), content_type: str = Form(...)):
    upload_id = str(uuid.uuid4())
    upload_path = UPLOAD_DIR / upload_id
    upload_path.mkdir(exist_ok=True)
    return {"upload_id": upload_id}

@api_router.post("/upload/{upload_id}/chunk")
async def upload_chunk(upload_id: str, chunk_index: int = Form(...), file: UploadFile = File(...)):
    upload_path = UPLOAD_DIR / upload_id
    if not upload_path.exists():
        raise HTTPException(status_code=404, detail="Upload session not found")
        
    chunk_path = upload_path / f"chunk_{chunk_index:04d}"
    async with aiofiles.open(chunk_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    return {"status": "success"}

@api_router.post("/upload/{upload_id}/complete")
async def upload_complete(upload_id: str, filename: str = Form(...), content_type: str = Form(...)):
    upload_path = UPLOAD_DIR / upload_id
    if not upload_path.exists():
        raise HTTPException(status_code=404, detail="Upload session not found")
        
    chunks = sorted(upload_path.iterdir())
    if not chunks:
        raise HTTPException(status_code=400, detail="No chunks found")
        
    stitched_path = UPLOAD_DIR / f"{upload_id}_stitched"
    size = 0
    with open(stitched_path, 'wb') as outfile:
        for chunk in chunks:
            with open(chunk, 'rb') as infile:
                data = infile.read()
                outfile.write(data)
                size += len(data)
                
    try:
        with open(stitched_path, 'rb') as f:
            full_data = f.read()
            
        ext = filename.split(".")[-1] if "." in filename else "bin"
        path = f"{APP_NAME}/{uuid.uuid4()}.{ext}"
        
        result = put_object(path, full_data, content_type or "application/octet-stream")
        
        file_record = FileRecord(
            storage_path=result["path"],
            original_filename=filename,
            content_type=content_type,
            size=result["size"]
        )
        await db.files.insert_one(file_record.model_dump())
        
        return {"id": file_record.id, "url": f"/api/files/{result['path']}"}
        
    finally:
        shutil.rmtree(upload_path, ignore_errors=True)
        if stitched_path.exists():
            stitched_path.unlink()

@api_router.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        data, content_type = get_object(path)
        return Response(content=data, media_type=record.get("content_type", content_type))
    except Exception as e:
        logger.error(f"Failed to fetch file: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving file from storage")

app.include_router(api_router)
