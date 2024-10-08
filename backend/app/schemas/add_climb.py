from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, List

# Climb Base Model
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

    @field_validator('tags', mode='before')
    def convert_tags_to_uppercase(cls, v):
        if v:
            return ",".join([tag.strip().upper() for tag in v.split(",")])
        return v

# Climb Create Model
class ClimbCreate(ClimbBase):
    pass

# Climb Model for Response
class Climb(ClimbBase):
    id: int
    area_id: Optional[int] = None

    class Config:
        from_attributes = True

# Area Base Model
class AreaBase(BaseModel):
    name: str
    polygon: Optional[str] = None

# Area Create Model
class AreaCreate(AreaBase):
    pass

# Area Model for Response
class Area(AreaBase):
    id: int

    class Config:
        from_attributes = True

# User Base Model
class UserBase(BaseModel):
    username: str = Field(..., min_length=3)
    email: EmailStr

# User Create Model
class UserCreate(UserBase):
    password: str = Field(..., min_length=5)

# User Model for Response
class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# Token Data Model
class TokenData(BaseModel):
    username: str

# Climb ID Request Model
class ClimbIDRequest(BaseModel):
    climb_id: int

# TickList Base Model
class TickListBase(BaseModel):
    climb_id: int

# TickList Create Model
class TickListCreate(TickListBase):
    pass

# TickList Model for Response
class TickList(TickListBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# HitList Base Model
class HitListBase(BaseModel):
    climb_id: int

# HitList Create Model
class HitListCreate(HitListBase):
    pass

# HitList Model for Response
class HitList(HitListBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

# Log Base Model
class LogBase(BaseModel):
    climb_id: int
    date: str
    grade: str
    comment: str

# Log Create Model
class LogCreate(LogBase):
    pass

# Log Model for Response
class Log(LogBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class LogWithUser(BaseModel):
    id: int
    climb_id: int
    date: str
    grade: str
    comment: str
    user_id: int
    username: str
    name: str  # Climb name
    type: str  # Climb type

    class Config:
        from_attributes = True

# Log ID Request Model
class LogIDRequest(BaseModel):
    log_id: int

class ClimbWithUser(BaseModel):
    id: int
    name: str
    grade: Optional[str]
    first_ascent_date: Optional[str]
    type: Optional[str]
    username: str  # Add the username field
    user_id: int   # Add the user ID field

    class Config:
        from_attributes = True