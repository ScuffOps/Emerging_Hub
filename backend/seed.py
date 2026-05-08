import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from models import CharacterProfile, Color, Personality, Skill, Lore, Relationship, Pet, AltOutfit

async def seed():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'testdb')]
    
    char = CharacterProfile(
        name="Veri",
        avatar="https://customer-assets.emergentagent.com/job_a5642998-d1ff-4501-9f69-da4970bc345c/artifacts/76c60ckv_Tenko%20Head%20Doodle.png",
        fullBody="https://customer-assets.emergentagent.com/job_74cdb3f5-3328-4f1c-b1f3-effa4135bdfd/artifacts/p47musk1_Viking%20Tongue%20FIN.png",
        altBody="https://customer-assets.emergentagent.com/job_74cdb3f5-3328-4f1c-b1f3-effa4135bdfd/artifacts/6bjkr1br_Heavens%20trans%20UPDATED%20FINAL.png",
        tagline="Digital Kitsune Spirit",
        themeSong="https://example.com/theme-song.mp3",
        themeSongTitle="Digital Dreams",
        colorPalette=[
            Color(name="Mint Cyan", hex="#B1EDE8"),
            Color(name="Teal Blue", hex="#3086AE"),
            Color(name="Dusty Purple", hex="#6D435A"),
        ],
        personality=Personality(
            traits=["Creative", "Playful", "Mysterious", "Artistic"],
            description="A mystical kitsune VTuber who bridges the gap between traditional Japanese folklore and modern digital art."
        ),
        likes=["Digital Art", "Fantasy Literature"],
        dislikes=["Technical Difficulties", "Spam Comments"],
        skills=[Skill(name="Live2D Rigging", level=90)],
        lore=Lore(
            origin="Born from the convergence of ancient spiritual energy and modern digital consciousness...",
            backstory="Once a guardian spirit of a sacred digital shrine...",
            currentGoal="To inspire others to embrace their creative potential..."
        ),
        relationships=[Relationship(name="Studio Team", type="Collaboration", status="Active")],
        designMotifs=["Fox/Kitsune imagery", "Digital glitch effects"],
        markings=["Spirit marks on cheeks", "Constellation patterns on arms"],
        accessories=["Digital hair ornaments", "Spirit beads bracelet"],
        pets=[Pet(name="Byte", type="Digital Fox Companion", description="A small holographic fox")],
        altOutfits=[AltOutfit(name="Default Outfit", type="Main")]
    )
    
    await db.characters.replace_one({}, char.model_dump(), upsert=True)
    print("Seeded successfully!")
    
if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv('.env')
    asyncio.run(seed())
