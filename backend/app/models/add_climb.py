from sqlalchemy import Column, Integer, String, Float, Date
from sqlalchemy.ext.declarative import declarative_base
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
    first_ascent_date = Column(Date)
    area = Column(String, index=True)  # Use area as a string field
    description = Column(String)
    tags = Column(String)

class Area(Base):
    __tablename__ = 'areas'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    polygon = Column(Geometry('POLYGON'))
