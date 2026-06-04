from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from typing import Optional
from pydantic import BaseModel
from app.database import get_db
from app.models import Theatre
from app.schemas import TheatreOut

router = APIRouter(prefix="/api/theatres", tags=["Theatres"])


@router.get("", response_model=list[TheatreOut])
async def list_theatres(
    city: Optional[str] = Query(None, description="Filter theatres by city or district name"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns theatres. The `city` param matches Theatre.city OR Theatre.district,
    so selecting a district like 'Sangareddy' returns theatres in that district.
    """
    query = select(Theatre)
    if city:
        query = query.where(
            or_(Theatre.city == city, Theatre.district == city)
        )
    result = await db.execute(query)
    theatres = result.scalars().all()
    return [TheatreOut.model_validate(t) for t in theatres]


@router.get("/{theatre_id}", response_model=TheatreOut)
async def get_theatre(theatre_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Theatre).where(Theatre.id == theatre_id))
    theatre = result.scalars().first()
    if not theatre:
        raise HTTPException(status_code=404, detail="Theatre not found")
    return TheatreOut.model_validate(theatre)


# ── Locations endpoint ────────────────────────────────────────────────────────

class LocationOut(BaseModel):
    name: str
    type: str        # "city" | "district"
    state: str
    parent_city: Optional[str] = None


@router.get("/locations/search", response_model=list[LocationOut], tags=["Locations"])
async def search_locations(
    q: Optional[str] = Query(None, description="Search query"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns all unique cities and districts that have theatres.
    If `q` is provided, filters by prefix match (case-insensitive).
    """
    result = await db.execute(select(Theatre))
    theatres = result.scalars().all()

    seen: dict[str, LocationOut] = {}

    for t in theatres:
        # Add city
        if t.city not in seen:
            seen[t.city] = LocationOut(
                name=t.city,
                type="city",
                state=t.state,
            )
        # Add district (if different from city)
        if t.district and t.district != t.city and t.district not in seen:
            seen[t.district] = LocationOut(
                name=t.district,
                type="district",
                state=t.state,
                parent_city=t.city,
            )

    locations = sorted(seen.values(), key=lambda l: l.name)

    if q:
        q_lower = q.lower().strip()
        locations = [
            loc for loc in locations
            if q_lower in loc.name.lower() or q_lower in loc.state.lower()
        ]

    return locations
