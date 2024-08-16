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
        from_attributes = True

class AreaBase(BaseModel):
    name: str
    polygon: Optional[str] = None

class AreaCreate(AreaBase):
    pass

class Area(AreaBase):
    id: int

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr
    password: str = Field(..., min_length=5)

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

class TokenData(BaseModel):
    username: str

class ClimbIDRequest(BaseModel):
    climb_id: int


class TickListBase(BaseModel):
    climb_id: int

class TickListCreate(TickListBase):
    pass

class TickList(TickListBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class HitListBase(BaseModel):
    climb_id: int

class HitListCreate(HitListBase):
    pass

class HitList(HitListBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

