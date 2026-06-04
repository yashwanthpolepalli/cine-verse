from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Seat, Showtime, Theatre
from app.schemas import SeatOut, SeatMapOut

router = APIRouter(prefix="/api/seats", tags=["Seats"])

ALPHABET = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]


@router.get("/{movie_id}", response_model=SeatMapOut)
async def get_seat_map(
    movie_id: str,
    theatre_id: str = Query(..., description="Theatre ID"),
    date: str = Query(..., description="Date string"),
    time: str = Query(..., description="Time string"),
    db: AsyncSession = Depends(get_db),
):
    """Get seat availability for a specific showing."""
    # Find the showtime
    result = await db.execute(
        select(Showtime)
        .where(Showtime.movie_id == movie_id)
        .where(Showtime.theatre_id == theatre_id)
        .where(Showtime.date == date)
        .where(Showtime.time == time)
    )
    showtime = result.scalars().first()

    if not showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")

    # Fetch the theatre configuration
    theatre_result = await db.execute(select(Theatre).where(Theatre.id == theatre_id))
    theatre = theatre_result.scalars().first()
    if not theatre:
        raise HTTPException(status_code=404, detail="Theatre not found")

    rows_list = ALPHABET[:theatre.rows_count]
    cols_count = theatre.cols_count

    # Get all seats for this showtime
    seat_result = await db.execute(
        select(Seat).where(Seat.showtime_id == showtime.id)
    )
    seats = seat_result.scalars().all()

    if not seats:
        import hashlib
        def _seat_status_hash(showtime_id: int, row: str, col: int) -> str:
            h = int(hashlib.md5(f"{showtime_id}{row}{col}".encode()).hexdigest(), 16)
            return "sold" if (h % 100) < 15 else "available"

        seats = []
        for r in rows_list:
            for c in range(1, cols_count + 1):
                seat = Seat(
                    showtime_id = showtime.id,
                    row         = r,
                    col         = c,
                    status      = _seat_status_hash(showtime.id, r, c),
                )
                db.add(seat)
                seats.append(seat)
        await db.commit()

    return SeatMapOut(
        rows=rows_list,
        cols=cols_count,
        seats=[SeatOut.model_validate(s) for s in seats],
        seat_price=theatre.ticket_price,
        booking_fee=theatre.booking_fee,
    )
