from pydantic import BaseModel
from typing import List, Optional

class ClimbBase(BaseModel):
    name: str
    type: str
    grade: str
    quality: int
    first_ascensionist: str
    first_ascent_date: str
    latitude: float
    longitude: float
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
    polygon: str

class AreaCreate(AreaBase):
    pass

class Area(AreaBase):
    id: int
    climbs: List[Climb] = []

    class Config:
        orm_mode = True
