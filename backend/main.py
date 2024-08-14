import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from shapely.wkb import loads as load_wkb
from shapely.wkt import loads as load_wkt
from shapely.geometry import shape
import xmltodict
from app.models import add_climb as models
from app.schemas import add_climb as schemas
from app.db.base import engine, SessionLocal
from typing import List
import logging

load_dotenv()  # Load environment variables from .env file

DATABASE_URL = os.getenv('DATABASE_URL')

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

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
        assign_climb_to_area(db_climb, db)
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

    for climb in climbs:
        if climb.first_ascent_date:
            climb.first_ascent_date = climb.first_ascent_date.isoformat()
            
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

# KML Upload and Area Assignment
@app.post("/upload_kml")
async def upload_kml(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.kml'):
        raise HTTPException(status_code=400, detail="Invalid file format. Please upload a KML file.")
    
    contents = await file.read()
    kml_data = xmltodict.parse(contents)
    coordinates_str = kml_data['kml']['Document']['Placemark']['Polygon']['outerBoundaryIs']['LinearRing']['coordinates']

    # Process coordinates
    coords = []
    for point in coordinates_str.strip().split():
        try:
            lon, lat, _ = map(float, point.split(","))
            coords.append([lon, lat])
        except ValueError as e:
            logger.error(f"Invalid coordinate value: {point} - {e}")

    if not coords:
        raise HTTPException(status_code=400, detail="No valid coordinates found in the KML file.")
    
    polygon = shape({"type": "Polygon", "coordinates": [coords]})

    new_area = models.Area(name=file.filename, polygon=polygon.wkt)
    db.add(new_area)
    db.commit()

    # Assign climbs to area
    assign_climbs_to_area(new_area, db)

    return {"filename": file.filename}

def assign_climbs_to_area(area, db):
    climbs = db.query(models.Climb).all()
    for climb in climbs:
        point = shape({"type": "Point", "coordinates": [climb.longitude, climb.latitude]})
        polygon = load_wkb(bytes(area.polygon.data))  # Convert WKBElement to Shapely geometry
        if point.within(polygon):
            climb.area = area.name  # Set the area name
            db.commit()


def assign_climb_to_area(climb, db):
    areas = db.query(models.Area).all()
    for area in areas:
        polygon = shape(area.polygon)
        point = shape({"type": "Point", "coordinates": [climb.longitude, climb.latitude]})
        if point.within(polygon):
            climb.area = area.name
            db.commit()
            break

    # Optionally, assign to "Uncontained Climbs" if no other area matched
    if not climb.area:
        climb.area = "Uncontained Climbs"
        db.commit()


    # Assign to "Uncontained Climbs" if no other area matched
    if not climb.area:
        climb.area = "Uncontained Climbs"
        db.commit()


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
