from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Text, DateTime, Index
)
from geoalchemy2 import Geography
from database import Base


class WaterPoint(Base):
    __tablename__ = "water_points"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)          # well, borehole, water_truck, spring, other
    status = Column(String(50), nullable=False)         # active, broken, abandoned
    water_quality = Column(String(50))                  # fresh, slightly_saline, saline, technical, unknown
    mineralization = Column(Float, nullable=True)
    depth = Column(Float, nullable=True)
    balance_holder = Column(String(255), nullable=True)
    location = Column(Geography(geometry_type="POINT", srid=4326))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    district = Column(String(255), nullable=True)
    region = Column(String(255), nullable=True)
    photo_url = Column(String(500), nullable=True)
    comment = Column(Text, nullable=True)
    added_by = Column(String(255), default="anonymous")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        Index("idx_water_points_status", status),
        Index("idx_water_points_quality", water_quality),
    )
