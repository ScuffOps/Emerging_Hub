import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from models import GalleryItem, BrandAsset, License, DebutAsset

async def seed_more():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'test_database')]
    
    # Gallery
    await db.gallery.delete_many({})
    gallery_item = GalleryItem(
        thumbnail="https://images.unsplash.com/photo-1763732397864-5b860bb298b0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxhbmltZSUyMGNoYXJhY3RlciUyMGFydHxlbnwwfHx8fDE3Njc0MjkwODF8MA&ixlib=rb-4.1.0&q=85",
        title="Character Reference Sheet",
        artistName="DigitalDreams",
        artistHandles={"twitter": "@digitaldreams"},
        platform="VGen",
        type="Full Body",
        status="Completed",
        payment=250.0,
        usageRights="Full Commercial",
        category="Character Design",
        tags=["reference", "full-body"],
        folder="Main/Character References",
        uploadDate="2024-01-15",
        description="Full character reference sheet"
    )
    await db.gallery.insert_one(gallery_item.model_dump())

    # Brands
    await db.brand_assets.delete_many({})
    brand = BrandAsset(
        title="Logo Pack",
        board="Branding",
        category="Logos",
        tags=["logo", "identity"],
        artist="BrandMaster",
        platform="VGen",
        urls=[],
        uploadDate="2024-01-01"
    )
    await db.brand_assets.insert_one(brand.model_dump())
    
    # Licenses
    await db.licenses.delete_many({})
    lic = License(
        item="Live2D Model",
        ownership="Full Rights",
        scope="Commercial Use",
        proofLinks=["https://example.com/proof"],
        notes="Perpetual license"
    )
    await db.licenses.insert_one(lic.model_dump())

    # Debut
    await db.debut_assets.delete_many({})
    debut = DebutAsset(
        title="Debut Stream Assets",
        description="Special assets for debut",
        category="Stream Graphics",
        tags=["debut"],
        thumbnail="https://images.unsplash.com/photo-1755593574938-6d66d28f8e57?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwyfHxhYnN0cmFjdCUyMGRhcmslMjBncmFkaWVudHxlbnwwfHx8fDE3Njc0MjkwNDN8MA&ixlib=rb-4.1.0&q=85",
        uploadDate="2024-03-01"
    )
    await db.debut_assets.insert_one(debut.model_dump())
    
    print("Seeded extra data!")

if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv('.env')
    asyncio.run(seed_more())
