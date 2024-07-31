from sqlalchemy import Column, Integer, String, Float, Date
from ..db.base import Base

class Climb(Base):
    __tablename__ = "climbs"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    quality = Column(Integer, nullable=False)
    first_ascensionist = Column(String, nullable=False)
    first_ascent_date = Column(Date, nullable=False)
    area = Column(String)
    description = Column(String)
    tags = Column(String)
