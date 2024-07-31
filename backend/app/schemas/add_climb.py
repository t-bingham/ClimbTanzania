from pydantic import BaseModel
from datetime import date
from typing import Optional

class ClimbBase(BaseModel):
    name: str
    description: Optional[str] = None

class ClimbCreate(ClimbBase):
    latitude: float
    longitude: float
    type: str
    grade: str
    quality: int
    first_ascensionist: str
    first_ascent_date: date
    area: Optional[str] = None
    tags: Optional[str] = None

class Climb(ClimbBase):
    id: int
    latitude: float
    longitude: float
    type: str
    grade: str
    quality: int
    first_ascensionist: str
    first_ascent_date: date
    area: Optional[str] = None
    tags: Optional[str] = None

    class Config:
        orm_mode = True
