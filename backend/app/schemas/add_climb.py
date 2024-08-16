#ClimbTanzania/backend/app/schemas/add_climb.py
from pydantic import BaseModel, EmailStr, Field
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
    area: Optional[str] = None

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


class UserBase(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=5)

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

class TokenData(BaseModel):
    username: str
