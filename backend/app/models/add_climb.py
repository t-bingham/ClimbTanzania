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
    logs = relationship("Log", back_populates="climb")
    ticklists = relationship("Ticklist", back_populates="climb")
    hitlists = relationship("Hitlist", back_populates="climb")

class Area(Base):
    __tablename__ = 'areas'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    polygon = Column(Geometry('POLYGON'))

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    logs = relationship("Log", back_populates="user")
    ticklists = relationship("Ticklist", back_populates="user")
    hitlists = relationship("Hitlist", back_populates="user")

class Ticklist(Base):
    __tablename__ = "ticklist"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    climb_id = Column(Integer, ForeignKey("climbs.id"))
    user = relationship("User", back_populates="ticklists")
    climb = relationship("Climb", back_populates="ticklists")


class Hitlist(Base):
    __tablename__ = "hitlist"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    climb_id = Column(Integer, ForeignKey("climbs.id"))
    user = relationship("User", back_populates="hitlists")
    climb = relationship("Climb", back_populates="hitlists")


class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    climb_id = Column(Integer, ForeignKey("climbs.id"))
    date = Column(String)
    grade = Column(String)
    comment = Column(String(100))

    user = relationship("User", back_populates="logs")
    climb = relationship("Climb", back_populates="logs")
