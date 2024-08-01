from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.db.base import engine, SessionLocal
from app.models import add_climb as models
from app.schemas import add_climb as schemas
from typing import List
import json
from datetime import date
import logging

app = FastAPI()

# Setup logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# In-memory storage for simplicity
users_db = {
    "admin": {
        "username": "admin",
        "hashed_password": pwd_context.hash("admin"),
    }
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(username: str, password: str):
    user = users_db.get(username)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": user["username"], "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
    user = authenticate_user(token, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Initialize the database models
models.Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/climbs/", response_model=schemas.Climb)
def create_climb(climb: schemas.ClimbCreate, db: Session = Depends(get_db)):
    logger.debug(f"Received climb data: {climb}")  # Debugging log
    try:
        db_climb = models.Climb(**climb.dict())
        db.add(db_climb)
        db.commit()
        db.refresh(db_climb)
        logger.debug(f"Inserted climb data: {db_climb}")  # Debugging log
        return db_climb
    except Exception as e:
        logger.error(f"Error inserting climb: {e}")
        raise HTTPException(status_code=400, detail=f"Error inserting climb: {e}")

@app.get("/climbs/", response_model=List[schemas.Climb])
def read_climbs(skip: int = 0, limit: int = 10, grades: str = None, type: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Climb)
    if grades:
        grade_list = grades.split(',')
        query = query.filter(models.Climb.grade.in_(grade_list))
    if type:
        query = query.filter(models.Climb.type == type)
    climbs = query.offset(skip).limit(limit).all()
    return climbs


@app.get("/climbs/{id}", response_model=schemas.Climb)
def read_climb(id: int, db: Session = Depends(get_db)):
    try:
        climb = db.query(models.Climb).filter(models.Climb.id == id).first()
        if climb is None:
            raise HTTPException(status_code=404, detail="Climb not found")
        return climb
    except Exception as e:
        logger.error(f"Error reading climb with id {id}: {e}")
        raise HTTPException(status_code=500, detail=f"Error reading climb with id {id}: {e}")

# Extend Climb model to handle dict conversion
def to_dict(self):
    return {
        "id": self.id,
        "latitude": self.latitude,
        "longitude": self.longitude,
        "name": self.name,
        "type": self.type,
        "grade": self.grade,
        "quality": self.quality,
        "first_ascensionist": self.first_ascensionist,
        "first_ascent_date": self.first_ascent_date.isoformat(),
        "area": self.area,
        "description": self.description,
        "tags": self.tags,
    }

models.Climb.to_dict = to_dict
