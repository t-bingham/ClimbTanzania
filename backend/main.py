import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Query
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
from datetime import date, datetime, timedelta
from jose import JWTError, jwt
from pydantic import EmailStr
from app.auth import get_current_user

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

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 180

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

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# Initialize the database models
models.Base.metadata.create_all(bind=engine)

@app.get("/users/", response_model=List[schemas.User])
def get_users(search: str = '', db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.username.ilike(f'%{search}%')).all()
    return users


@app.get("/users/{id}", response_model=schemas.User)
def get_user_by_id(id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/users/{id}/ticks", response_model=List[schemas.Climb])
def get_user_ticks(id: int, db: Session = Depends(get_db)):
    ticklist_climbs = (
        db.query(models.Climb)
        .join(models.Ticklist, models.Climb.id == models.Ticklist.climb_id)
        .filter(models.Ticklist.user_id == id)
        .all()
    )

    for climb in ticklist_climbs:
        if isinstance(climb.first_ascent_date, date):
            climb.first_ascent_date = climb.first_ascent_date.isoformat()

    return ticklist_climbs


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
def read_climbs(skip: int = 0, limit: int = 25, grades: str = None, areas: str = None, type: str = None, first_ascensionist: str = None, db: Session = Depends(get_db)):
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
    
    # Filter by first ascensionist
    if first_ascensionist:
        query = query.filter(models.Climb.first_ascensionist == first_ascensionist)

    # Apply pagination
    climbs = query.offset(skip).limit(limit).all()

    # Convert date fields to strings
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


@app.post("/ticklist/add")
async def add_to_ticklist(request: schemas.ClimbIDRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        climb = db.query(models.Climb).filter(models.Climb.id == request.climb_id).first()
        if not climb:
            raise HTTPException(status_code=404, detail="Climb not found")
        
        # Check if the climb is already in the user's ticklist
        existing_entry = db.query(models.Ticklist).filter(models.Ticklist.user_id == current_user.id, models.Ticklist.climb_id == climb.id).first()
        if existing_entry:
            raise HTTPException(status_code=400, detail="Climb already in ticklist")
        
        # Add the climb to the user's ticklist
        new_entry = models.Ticklist(user_id=current_user.id, climb_id=climb.id)
        db.add(new_entry)
        db.commit()
        
        return {"msg": "Climb added to ticklist"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@app.post("/ticklist/remove")
async def remove_from_ticklist(request: schemas.ClimbIDRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        climb = db.query(models.Climb).filter(models.Climb.id == request.climb_id).first()
        if not climb:
            raise HTTPException(status_code=404, detail="Climb not found")
        
        # Check if the climb is in the user's ticklist
        existing_entry = db.query(models.Ticklist).filter(models.Ticklist.user_id == current_user.id, models.Ticklist.climb_id == climb.id).first()
        if not existing_entry:
            raise HTTPException(status_code=400, detail="Climb not in ticklist")
        
        # Remove the climb from the user's ticklist
        db.delete(existing_entry)
        db.commit()
        
        return {"msg": "Climb removed from ticklist"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))



@app.get("/ticklist/", response_model=List[schemas.Climb])
def get_ticklist(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    ticklist_climbs = (
        db.query(models.Climb)
        .join(models.Ticklist, models.Climb.id == models.Ticklist.climb_id)
        .filter(models.Ticklist.user_id == current_user.id)
        .all()
    )


    for climb in ticklist_climbs:
        if isinstance(climb.first_ascent_date, date):
            climb.first_ascent_date = climb.first_ascent_date.isoformat()

    return ticklist_climbs


@app.post("/logs/")
async def create_log(log: schemas.LogCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_log = models.Log(
        user_id=current_user.id,
        climb_id=log.climb_id,
        date=log.date,
        grade=log.grade,
        comment=log.comment,
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log


@app.post("/logs/add")
async def add_log(request: schemas.LogCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        climb = db.query(models.Climb).filter(models.Climb.id == request.climb_id).first()
        if not climb:
            raise HTTPException(status_code=404, detail="Climb not found")

        # Check if a log for this climb already exists for the user
        existing_log = db.query(models.Log).filter(
            models.Log.user_id == current_user.id,
            models.Log.climb_id == climb.id
        ).first()
        if existing_log:
            raise HTTPException(status_code=400, detail="Log for this climb already exists")

        # Add the log to the user's logs
        new_log = models.Log(
            user_id=current_user.id,
            climb_id=climb.id,
            date=request.date,
            grade=request.grade,
            comment=request.comment
        )
        db.add(new_log)
        db.commit()

        return {"msg": "Log added successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/logs/remove")
async def remove_log(request: schemas.ClimbIDRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        log = db.query(models.Log).filter(models.Log.user_id == current_user.id, models.Log.climb_id == request.climb_id).first()
        if not log:
            raise HTTPException(status_code=404, detail="Log not found")

        db.delete(log)
        db.commit()

        return {"msg": "Log removed successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/climbs/{id}/logs", response_model=List[schemas.LogWithUser])
async def get_climb_logs(id: int, db: Session = Depends(get_db)):
    logs = (
        db.query(models.Log, models.User.username)
        .join(models.User, models.Log.user_id == models.User.id)
        .filter(models.Log.climb_id == id)
        .all()
    )

    return [
        schemas.LogWithUser(
            id=log.Log.id,
            climb_id=log.Log.climb_id,
            date=log.Log.date,
            grade=log.Log.grade,
            comment=log.Log.comment,
            user_id=log.Log.user_id,
            username=log.username
        )
        for log in logs
    ]


@app.get("/logs/recent", response_model=List[schemas.LogWithUser])
def get_recent_ticks(limit: int = 10, db: Session = Depends(get_db)):
    recent_ticks = (
        db.query(models.Log, models.User.username, models.Climb.name, models.Climb.type)
        .join(models.User, models.Log.user_id == models.User.id)
        .join(models.Climb, models.Log.climb_id == models.Climb.id)
        .order_by(models.Log.date.desc())
        .limit(limit)
        .all()
    )

    return [
        schemas.LogWithUser(
            id=log.id,
            climb_id=log.climb_id,
            date=log.date,
            grade=log.grade,
            comment=log.comment,
            user_id=log.user_id,
            username=username,  # Access the username directly from the tuple
            name=climb_name,  # Access the climb name directly from the tuple
            type=climb_type   # Access the climb type directly from the tuple
        )
        for log, username, climb_name, climb_type in recent_ticks
    ]


@app.get("/climbs/recent/first-ascents", response_model=List[schemas.ClimbWithUser])
def get_recent_first_ascents(limit: int = 5, db: Session = Depends(get_db)):
    try:
        recent_first_ascents = (
            db.query(models.Climb, models.User.username, models.User.id)
            .join(models.User, models.Climb.first_ascensionist == models.User.username)
            .filter(models.Climb.first_ascensionist.isnot(None))
            .order_by(models.Climb.first_ascent_date.desc())
            .limit(limit)
            .all()
        )

        return [
            schemas.ClimbWithUser(
                id=climb.id,
                name=climb.name,
                grade=climb.grade,
                first_ascent_date=climb.first_ascent_date.isoformat() if climb.first_ascent_date else None,
                type=climb.type,
                username=username,
                user_id=user_id
            )
            for climb, username, user_id in recent_first_ascents
        ]
    except Exception as e:
        logger.error(f"Error fetching recent first ascents: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.get("/logs/recent_big_ticks", response_model=List[schemas.LogWithUser])
def get_recent_big_ticks(limit: int = 5, db: Session = Depends(get_db)):
    big_ticks = (
        db.query(models.Log, models.User.username, models.Climb.name, models.Climb.type)
        .join(models.User, models.Log.user_id == models.User.id)
        .join(models.Climb, models.Log.climb_id == models.Climb.id)
        .filter(
            (models.Log.grade.ilike('V9%')) |
            (models.Log.grade.ilike('V10%')) |
            (models.Log.grade.ilike('V11%')) |
            (models.Log.grade.ilike('V12%')) |
            (models.Log.grade.ilike('V13%')) |
            (models.Log.grade.ilike('V14%')) |
            (models.Log.grade.ilike('V15%')) |
            (models.Log.grade.ilike('V16%')) |
            (models.Log.grade.ilike('V17%')) |
            (models.Log.grade.ilike('8b%')) | 
            (models.Log.grade.ilike('8b+%')) | 
            (models.Log.grade.ilike('8c%')) | 
            (models.Log.grade.ilike('8c+%')) |
            (models.Log.grade.ilike('9a%')) | 
            (models.Log.grade.ilike('9a+%')) | 
            (models.Log.grade.ilike('9b%')) | 
            (models.Log.grade.ilike('9b+%')) | 
            (models.Log.grade.ilike('9c%'))
        )
        .order_by(models.Log.date.desc())
        .limit(limit)
        .all()
    )

    return [
        schemas.LogWithUser(
            id=log.id,
            climb_id=log.climb_id,
            date=log.date,
            grade=log.grade,
            comment=log.comment,
            user_id=log.user_id,
            username=username,
            name=climb_name,
            type=climb_type
        )
        for log, username, climb_name, climb_type in big_ticks
    ]




@app.post("/hitlist/add")
async def add_to_hitlist(request: schemas.HitListCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        climb = db.query(models.Climb).filter(models.Climb.id == request.climb_id).first()
        if not climb:
            raise HTTPException(status_code=404, detail="Climb not found")
        
        # Check if the climb is already in the user's hitlist
        existing_entry = db.query(models.Hitlist).filter(models.Hitlist.user_id == current_user.id, models.Hitlist.climb_id == climb.id).first()
        if existing_entry:
            raise HTTPException(status_code=400, detail="Climb already in hitlist")
        
        # Add the climb to the user's hitlist
        new_entry = models.Hitlist(user_id=current_user.id, climb_id=climb.id)
        db.add(new_entry)
        db.commit()
        
        return {"msg": "Climb added to hitlist"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/hitlist/remove")
async def remove_from_hitlist(request: schemas.ClimbIDRequest, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    try:
        climb = db.query(models.Climb).filter(models.Climb.id == request.climb_id).first()
        if not climb:
            raise HTTPException(status_code=404, detail="Climb not found")
        
        # Check if the climb is in the user's hitlist
        existing_entry = db.query(models.Hitlist).filter(models.Hitlist.user_id == current_user.id, models.Hitlist.climb_id == climb.id).first()
        if not existing_entry:
            raise HTTPException(status_code=400, detail="Climb not in hitlist")
        
        # Remove the climb from the user's hitlist
        db.delete(existing_entry)
        db.commit()
        
        return {"msg": "Climb removed from hitlist"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/hitlist/", response_model=List[schemas.Climb])
def get_hitlist(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    hitlist_climbs = (
        db.query(models.Climb)
        .join(models.Hitlist, models.Climb.id == models.Hitlist.climb_id)
        .filter(models.Hitlist.user_id == current_user.id)
        .all()
    )

    for climb in hitlist_climbs:
        if isinstance(climb.first_ascent_date, date):
            climb.first_ascent_date = climb.first_ascent_date.isoformat()

    return hitlist_climbs


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
