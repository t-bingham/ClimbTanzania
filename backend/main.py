import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from shapely.geometry import shape, Point
import xmltodict
from app.models import add_climb as models
from app.schemas import add_climb as schemas
from app.db.base import engine, SessionLocal
from typing import List
import logging
from geoalchemy2.shape import to_shape
from geoalchemy2.elements import WKBElement
from sqlalchemy import func
from datetime import date
from jose import JWTError, jwt
from pydantic import EmailStr

# Load environment variables from .env file
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# FastAPI app initialization
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

# OAuth2 configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": user.username, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = get_user(db, token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# Initialize the database models
models.Base.metadata.create_all(bind=engine)

@app.post("/register")
async def register(
    form_data: OAuth2PasswordRequestForm = Depends(),
    email: EmailStr = Form(...),
    db: Session = Depends(get_db)
):
    # Validate username length
    if len(form_data.username) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username must be at least 3 characters long",
        )

    # Validate password length
    if len(form_data.password) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 5 characters long",
        )

    # Check if the username or email already exists
    existing_user = db.query(models.User).filter(
        (models.User.username == form_data.username) | (models.User.email == email)
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already taken",
        )

    # Create the new user
    hashed_password = pwd_context.hash(form_data.password)
    new_user = models.User(username=form_data.username, email=email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"msg": "User created successfully"}


@app.post("/climbs/", response_model=schemas.Climb)
def create_climb(climb: schemas.ClimbCreate, db: Session = Depends(get_db)):
    logger.debug(f"Received climb data: {climb}")  # Debugging log
    try:
        db_climb = models.Climb(**climb.dict())
        
        # Determine if the climb is within any existing area
        assigned_area = db.query(models.Area).filter(
            func.ST_Contains(
                func.ST_SetSRID(models.Area.polygon, 4326),
                func.ST_SetSRID(func.ST_MakePoint(db_climb.longitude, db_climb.latitude), 4326)
            )
        ).first()

        if assigned_area:
            db_climb.area = assigned_area.name
        else:
            db_climb.area = "Independent Climbs"

        db.add(db_climb)
        db.commit()
        db.refresh(db_climb)

        # Convert first_ascent_date to string if it's a date object
        if isinstance(db_climb.first_ascent_date, date):
            db_climb.first_ascent_date = db_climb.first_ascent_date.isoformat()

        logger.debug(f"Inserted climb data: {db_climb}")  # Debugging log
        return db_climb
    except Exception as e:
        logger.error(f"Error inserting climb: {e}")
        raise HTTPException(status_code=400, detail=f"Error inserting climb: {e}")

@app.get("/climbs/", response_model=List[schemas.Climb])
def read_climbs(skip: int = 0, limit: int = 1000, grades: str = None, areas: str = None, type: str = None, db: Session = Depends(get_db)):
    query = db.query(models.Climb)

    # Filter by type (e.g., Boulder)
    if type:
        query = query.filter(models.Climb.type == type)

    # Filter by grades
    if grades:
        grade_list = grades.split(',')
        query = query.filter(models.Climb.grade.in_(grade_list))

    # Filter by area name with SRID enforcement
    if areas:
        area_list = areas.split(',')

        if "Independent Climbs" in area_list:
            query = query.filter(
                (models.Climb.area.in_(area_list)) | 
                (models.Climb.area == None) | 
                (models.Climb.area == '')
            )
        else:
            query = query.filter(
                db.query(models.Area)
                .filter(
                    models.Area.name.in_(area_list),
                    func.ST_Contains(
                        func.ST_Transform(func.ST_SetSRID(models.Area.polygon, 4326), 4326), 
                        func.ST_SetSRID(func.ST_MakePoint(models.Climb.longitude, models.Climb.latitude), 4326)
                    )
                )
                .exists()
            )

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
        
        # Convert first_ascent_date to string if it's a date object
        if isinstance(climb.first_ascent_date, date):
            climb.first_ascent_date = climb.first_ascent_date.isoformat()

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

    # Ensure SRID is set to 4326
    new_area = models.Area(name=file.filename, polygon=from_shape(polygon, srid=4326))
    db.add(new_area)
    db.commit()

    # Assign climbs to area
    assign_climbs_to_area(new_area, db)

    return {"filename": file.filename}

@app.get("/areas/", response_model=List[schemas.Area])
def get_areas(db: Session = Depends(get_db)):
    areas = db.query(
        models.Area.id,
        models.Area.name,
        func.ST_AsText(models.Area.polygon).label('polygon')
    ).all()
    
    print(f"Queried areas with WKT: {areas}")

    # Convert the queried data into the desired structure
    polygons = [
        {"id": area.id, "name": area.name, "polygon": area.polygon}
        for area in areas
    ]

    print(f"Final polygons list: {polygons}")
    return polygons

@app.post("/assign_existing_climbs/")
def assign_existing_climbs(db: Session = Depends(get_db)):
    climbs = db.query(models.Climb).all()
    areas = db.query(models.Area).all()

    for climb in climbs:
        point = Point(climb.longitude, climb.latitude)
        assigned = False

        for area in areas:
            try:
                # Ensure polygon is correctly parsed from WKB
                if isinstance(area.polygon, WKBElement):
                    polygon = to_shape(area.polygon)  # Using geoalchemy2's to_shape for safer conversion
                else:
                    continue  # Skip if the polygon is not valid

                if point.within(polygon):
                    climb.area = area.name
                    db.commit()
                    assigned = True
                    break
            except Exception as e:
                logger.error(f"Error processing area '{area.name}' for climb '{climb.name}': {e}")
                continue

        if not assigned:
            climb.area = "Independent Climbs"
            db.commit()

    return {"status": "success", "message": "Climbs have been assigned to areas."}


def assign_climbs_to_area(area, db):
    climbs = db.query(models.Climb).all()
    for climb in climbs:
        point = Point(climb.longitude, climb.latitude)
        polygon = shape(load_wkt(area.polygon))

        if polygon.contains(point):
            climb.area = area.name
            db.commit()

def assign_climb_to_area(climb, db):
    areas = db.query(models.Area).all()
    for area in areas:
        polygon = shape(load_wkt(area.polygon))
        point = Point(climb.longitude, climb.latitude)

        if polygon.contains(point):
            climb.area = area.name
            db.commit()
            break

    # Assign to "Independent Climbs" if no other area matched
    if not climb.area:
        climb.area = "Independent Climbs"
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
