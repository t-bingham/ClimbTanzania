#ClimbTanzania/backend/app/schemas/add_climb.py
from pydantic import BaseModel
from typing import Optional

class ClimbBase(BaseModel):
    latitude: float
    longitude: float
    name: str
    type: str
    grade: Optional[str] = None
    quality: Optional[int] = None
    first_ascensionist: Optional[str] = None
    first_ascent_date: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None

class ClimbCreate(ClimbBase):
    pass

class Climb(ClimbBase):
    id: int
    area_id: Optional[int] = None

    class Config:
        orm_mode = True

class AreaBase(BaseModel):
    name: str
    polygon: Optional[str] = None

class AreaCreate(AreaBase):
    pass

class Area(AreaBase):
    id: int

    class Config:
        orm_mode = True
