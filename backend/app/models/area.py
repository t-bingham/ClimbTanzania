from sqlalchemy import Column, Integer, String, Text
from ..db.base import Base

class Area(Base):
    __tablename__ = "areas"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    polygon = Column(Text, nullable=False)
