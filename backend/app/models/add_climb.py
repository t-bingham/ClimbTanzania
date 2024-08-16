# ClimbTanzania/backend/app/models/add_climb.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

Base = declarative_base()

class Climb(Base):
    __tablename__ = 'climbs'
    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    name = Column(String, index=True)
    type = Column(String, index=True)
    grade = Column(String, index=True)
    quality = Column(Integer)
    first_ascensionist = Column(String)
    first_ascent_date = Column(String)
    area = Column(String, index=True)  # Use area as a string field
    description = Column(String)
    tags = Column(String)

class Area(Base):
    __tablename__ = 'areas'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    polygon = Column(Geometry('POLYGON'))

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Ticklist(Base):
    __tablename__ = 'ticklist'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    climb_id = Column(Integer, ForeignKey('climbs.id'))
    user = relationship("User")
    climb = relationship("Climb")

class Hitlist(Base):
    __tablename__ = "hitlist"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    climb_id = Column(Integer, ForeignKey("climbs.id"))
    user = relationship("User")
    climb = relationship("Climb")