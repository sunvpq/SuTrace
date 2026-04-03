import math
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import func, text
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import WaterPoint

Base.metadata.create_all(bind=engine, checkfirst=True)

app = FastAPI(title="SuTrace API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------- Schemas ---------------

class PointCreate(BaseModel):
    name: str
    type: str
    status: str
    water_quality: Optional[str] = "unknown"
    mineralization: Optional[float] = None
    depth: Optional[float] = None
    balance_holder: Optional[str] = None
    latitude: float
    longitude: float
    district: Optional[str] = None
    region: Optional[str] = None
    photo_url: Optional[str] = None
    comment: Optional[str] = None
    added_by: Optional[str] = "anonymous"


class PointUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    water_quality: Optional[str] = None
    mineralization: Optional[float] = None
    depth: Optional[float] = None
    balance_holder: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    district: Optional[str] = None
    region: Optional[str] = None
    photo_url: Optional[str] = None
    comment: Optional[str] = None


class PointOut(BaseModel):
    id: int
    name: str
    type: str
    status: str
    water_quality: Optional[str]
    mineralization: Optional[float]
    depth: Optional[float]
    balance_holder: Optional[str]
    latitude: float
    longitude: float
    district: Optional[str]
    region: Optional[str]
    photo_url: Optional[str]
    comment: Optional[str]
    added_by: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# --------------- Helpers ---------------

def point_to_dict(p: WaterPoint) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "type": p.type,
        "status": p.status,
        "water_quality": p.water_quality,
        "mineralization": p.mineralization,
        "depth": p.depth,
        "balance_holder": p.balance_holder,
        "latitude": p.latitude,
        "longitude": p.longitude,
        "district": p.district,
        "region": p.region,
        "photo_url": p.photo_url,
        "comment": p.comment,
        "added_by": p.added_by,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }


# --------------- Endpoints ---------------

@app.get("/api/points")
def get_points(
    type: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    water_quality: Optional[str] = Query(None),
    region: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(WaterPoint)
    if type:
        q = q.filter(WaterPoint.type == type)
    if status:
        q = q.filter(WaterPoint.status == status)
    if water_quality:
        q = q.filter(WaterPoint.water_quality == water_quality)
    if region:
        q = q.filter(WaterPoint.region == region)
    points = q.order_by(WaterPoint.created_at.desc()).all()
    return [point_to_dict(p) for p in points]


@app.get("/api/points/nearest")
def get_nearest_point(
    lat: float = Query(...),
    lon: float = Query(...),
    quality: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(WaterPoint).filter(WaterPoint.status == "active")
    if quality:
        q = q.filter(WaterPoint.water_quality == quality)
    points = q.all()
    if not points:
        raise HTTPException(status_code=404, detail="No points found")
    nearest = min(
        points,
        key=lambda p: math.sqrt((p.latitude - lat) ** 2 + (p.longitude - lon) ** 2)
    )
    dist = math.sqrt((nearest.latitude - lat) ** 2 + (nearest.longitude - lon) ** 2)
    # Convert degrees to approximate metres (1 degree ≈ 111 km)
    dist_m = dist * 111_000
    d = point_to_dict(nearest)
    d["distance_m"] = round(dist_m, 1)
    return d


@app.get("/api/points/{point_id}")
def get_point(point_id: int, db: Session = Depends(get_db)):
    p = db.query(WaterPoint).filter(WaterPoint.id == point_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Point not found")
    return point_to_dict(p)


@app.post("/api/points", status_code=201)
def create_point(data: PointCreate, db: Session = Depends(get_db)):
    point = WaterPoint(
        name=data.name,
        type=data.type,
        status=data.status,
        water_quality=data.water_quality,
        mineralization=data.mineralization,
        depth=data.depth,
        balance_holder=data.balance_holder,
        latitude=data.latitude,
        longitude=data.longitude,
        district=data.district,
        region=data.region,
        photo_url=data.photo_url,
        comment=data.comment,
        added_by=data.added_by or "anonymous",
    )
    db.add(point)
    db.commit()
    db.refresh(point)
    return point_to_dict(point)


@app.put("/api/points/{point_id}")
def update_point(point_id: int, data: PointUpdate, db: Session = Depends(get_db)):
    point = db.query(WaterPoint).filter(WaterPoint.id == point_id).first()
    if not point:
        raise HTTPException(status_code=404, detail="Point not found")
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(point, key, value)
    point.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(point)
    return point_to_dict(point)


@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(WaterPoint.id)).scalar()
    active = db.query(func.count(WaterPoint.id)).filter(WaterPoint.status == "active").scalar()
    broken = db.query(func.count(WaterPoint.id)).filter(WaterPoint.status == "broken").scalar()
    abandoned = db.query(func.count(WaterPoint.id)).filter(WaterPoint.status == "abandoned").scalar()
    fresh = db.query(func.count(WaterPoint.id)).filter(WaterPoint.water_quality == "fresh").scalar()
    saline = db.query(func.count(WaterPoint.id)).filter(WaterPoint.water_quality == "saline").scalar()
    technical = db.query(func.count(WaterPoint.id)).filter(WaterPoint.water_quality == "technical").scalar()
    return {
        "total": total,
        "by_status": {"active": active, "broken": broken, "abandoned": abandoned},
        "by_quality": {
            "fresh": fresh,
            "saline": saline,
            "technical": technical,
            "slightly_saline": db.query(func.count(WaterPoint.id)).filter(WaterPoint.water_quality == "slightly_saline").scalar(),
            "unknown": db.query(func.count(WaterPoint.id)).filter(WaterPoint.water_quality == "unknown").scalar(),
        },
    }


@app.get("/api/stats/by-district")
def get_stats_by_district(db: Session = Depends(get_db)):
    rows = (
        db.query(WaterPoint.district, func.count(WaterPoint.id))
        .group_by(WaterPoint.district)
        .order_by(func.count(WaterPoint.id).desc())
        .all()
    )
    return [{"district": d or "Неизвестно", "count": c} for d, c in rows]


@app.get("/")
def root():
    return {"message": "SuTrace API is running"}
