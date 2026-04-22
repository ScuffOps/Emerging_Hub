import os
import logging
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

def create_token():
    return jwt.encode({"exp": datetime.now(timezone.utc) + timedelta(hours=24)}, JWT_SECRET, algorithm="HS256")

def verify_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.split(" ")[1]
    try:
        jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return True

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

# Brand Assets
@api_router.get("/brand", response_model=list[BrandAsset])
async def get_brand_assets(limit: int = 100, skip: int = 0):
    return await db.brand_assets.find({"is_deleted": False}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)

@api_router.post("/brand", response_model=BrandAsset)
async def create_brand_asset(item: dict):
    item_obj = BrandAsset(**item)
    await db.brand_assets.insert_one(item_obj.model_dump())
    return item_obj

@api_router.delete("/brand/{id}")
async def delete_brand_asset(id: str):
    await db.brand_assets.update_one({"id": id}, {"$set": {"is_deleted": True}})
    return {"status": "deleted"}

# Licenses
@api_router.get("/licenses", response_model=list[License])
async def get_licenses(limit: int = 100, skip: int = 0):
    return await db.licenses.find({"is_deleted": False}, {"_id": 0}).skip(skip).limit(limit).to_list(limit)

@api_router.post("/licenses", response_model=License)
async def create_license(item: dict):
    item_obj = License(**item)
    await db.licenses.insert_one(item_obj.model_dump())
    return item_obj

@api_router.delete("/licenses/{id}")
async def delete_license(id: str):
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
    authorization: str = Header(None),
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
    is_admin = _optional_auth(authorization)
    query = {"is_deleted": False}

    # Visibility gating
    if not is_admin:
        query["visibility"] = "public"
    elif visibility:
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
async def commissions_stats(authorization: str = Header(None)):
    is_admin = _optional_auth(authorization)
    query = {"is_deleted": False}
    if not is_admin:
        query["visibility"] = "public"
    items = await db.commissions.find(query, {"_id": 0}).to_list(1000)
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
