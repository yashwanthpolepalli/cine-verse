from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.models import Showtime, Theatre
from app.schemas import DateOut
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/showtimes", tags=["Showtimes"])


@router.get("", response_model=list[str])
async def get_showtimes(
    movie_id: str = Query(..., description="Movie ID"),
    theatre_id: str = Query(..., description="Theatre ID"),
    date: str = Query(..., description="Date string e.g. 'Jun 3'"),
    db: AsyncSession = Depends(get_db),
):
    """Get available showtime slots for a movie at a theatre on a date."""
    result = await db.execute(
        select(Showtime.time)
        .where(Showtime.movie_id == movie_id)
        .where(Showtime.theatre_id == theatre_id)
        .where(Showtime.date == date)
        .distinct()
    )
    times = [row[0] for row in result.all()]
    
    # Check if this query is for today's date
    now = datetime.now()
    today_str = now.strftime("%b ") + str(now.day)
    
    if date == today_str:
        future_times = []
        for t_str in times:
            try:
                # Parse e.g. "11:30 AM", "2:45 PM", "6:15 PM"
                t_parsed = datetime.strptime(t_str, "%I:%M %p").time()
                if t_parsed > now.time():
                    future_times.append(t_str)
            except Exception:
                # If parsing fails, default to including the time slot
                future_times.append(t_str)
        times = future_times

    # Sort times chronologically
    def _parse_time(t_str):
        try:
            return datetime.strptime(t_str, "%I:%M %p").time()
        except Exception:
            return datetime.min.time()

    return sorted(times, key=_parse_time)


@router.get("/theatres", response_model=list[str])
async def get_theatres_with_showtimes(
    movie_id: str = Query(..., description="Movie ID"),
    city: Optional[str] = Query(None, description="Filter by city"),
    db: AsyncSession = Depends(get_db),
):
    """Get theatre IDs that actually have showtimes for a given movie (optionally in a city/district)."""
    from sqlalchemy import or_
    query = (
        select(Showtime.theatre_id)
        .where(Showtime.movie_id == movie_id)
        .distinct()
    )
    if city:
        query = (
            select(Showtime.theatre_id)
            .join(Theatre, Showtime.theatre_id == Theatre.id)
            .where(Showtime.movie_id == movie_id)
            .where(or_(Theatre.city == city, Theatre.district == city))
            .distinct()
        )
    result = await db.execute(query)
    return [row[0] for row in result.all()]


@router.get("/dates", response_model=list[DateOut])
async def get_dates(
    movie_id: str = Query(..., description="Movie ID"),
    city: Optional[str] = Query(None, description="Filter by city"),
    db: AsyncSession = Depends(get_db),
):
    """Get available dates for a movie, optionally scoped to theatres in a city/district."""
    from sqlalchemy import or_
    if city:
        query = (
            select(Showtime.date)
            .join(Theatre, Showtime.theatre_id == Theatre.id)
            .where(Showtime.movie_id == movie_id)
            .where(or_(Theatre.city == city, Theatre.district == city))
            .distinct()
        )
    else:
        query = (
            select(Showtime.date)
            .where(Showtime.movie_id == movie_id)
            .distinct()
        )
    result = await db.execute(query)
    date_strings = [row[0] for row in result.all()]

    # Build date objects with labels
    today = datetime.now()
    dates = []
    for i in range(5):
        d = today + timedelta(days=i)
        date_str = d.strftime("%b %-d")
        if date_str in date_strings:
            label = "Today" if i == 0 else d.strftime("%a")
            dates.append(DateOut(label=label, date=date_str))

    # If no dynamic dates matched, return what's in DB
    if not dates:
        for ds in sorted(date_strings)[:5]:
            dates.append(DateOut(label=ds, date=ds))

    return dates

