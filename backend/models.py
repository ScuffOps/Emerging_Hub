from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
import uuid
from datetime import datetime, timezone

class Color(BaseModel):
    name: str
    hex: str

class Personality(BaseModel):
    traits: List[str]
    description: str

class Skill(BaseModel):
    name: str
    level: int

class Lore(BaseModel):
    origin: str
    backstory: str
    currentGoal: str

class Relationship(BaseModel):
    name: str
    type: str
    status: str

class Pet(BaseModel):
    name: str
    type: str
    description: str

class AltOutfit(BaseModel):
    name: str
    type: str

class CharacterProfile(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    avatar: str
    fullBody: str
    altBody: str
    tagline: str
    themeSong: str
    themeSongTitle: str
    colorPalette: List[Color]
    personality: Personality
    likes: List[str]
    dislikes: List[str]
    skills: List[Skill]
    lore: Lore
    relationships: List[Relationship]
    designMotifs: List[str]
    markings: List[str]
    accessories: List[str]
    pets: List[Pet]
    altOutfits: List[AltOutfit]

class GalleryItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    thumbnail: str
    title: str
    artistName: str
    artistHandles: Dict[str, str] = Field(default_factory=dict)
    platform: str
    type: str
    status: str
    payment: float
    usageRights: str
    category: str
    tags: List[str] = Field(default_factory=list)
    folder: str
    uploadDate: str
    description: str
    files: List[str] = Field(default_factory=list)
    is_deleted: bool = Field(default=False)

class BrandAsset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    board: str
    category: str
    tags: List[str] = Field(default_factory=list)
    artist: str
    platform: str
    urls: List[str] = Field(default_factory=list)
    uploadDate: str
    is_deleted: bool = Field(default=False)

class License(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    item: str
    ownership: str
    scope: str
    proofLinks: List[str] = Field(default_factory=list)
    expiryDate: Optional[str] = None
    notes: Optional[str] = None
    is_deleted: bool = Field(default=False)

class DebutAsset(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    tags: List[str] = Field(default_factory=list)
    thumbnail: str
    uploadDate: str
    is_deleted: bool = Field(default=False)

class AuthRequest(BaseModel):
    password: str

class AuthResponse(BaseModel):
    token: str

class FileRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    storage_path: str
    original_filename: str
    content_type: str
    size: int
    is_deleted: bool = Field(default=False)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
