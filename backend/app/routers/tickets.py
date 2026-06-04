import json
import random
import string
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Ticket, Seat, Showtime, Theatre
from app.schemas import TicketCreate, TicketOut

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


def _generate_ticket_id() -> str:
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=6))
    return f"LMR-{suffix}"


def _ticket_to_out(ticket: Ticket) -> TicketOut:
    return TicketOut(
        id=ticket.id,
        movie_id=ticket.movie_id,
        theatre_id=ticket.theatre_id,
        date=ticket.date,
        time=ticket.time,
        seats=json.loads(ticket.seats_json),
        total=ticket.total,
        created_at=ticket.created_at,
    )


@router.get("", response_model=list[TicketOut])
async def list_tickets(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).order_by(Ticket.created_at.desc()))
    tickets = result.scalars().all()
    return [_ticket_to_out(t) for t in tickets]


@router.get("/{ticket_id}", response_model=TicketOut)
async def get_ticket(ticket_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ticket).where(Ticket.id == ticket_id))
    ticket = result.scalars().first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return _ticket_to_out(ticket)


@router.post("", response_model=TicketOut, status_code=201)
async def create_ticket(data: TicketCreate, db: AsyncSession = Depends(get_db)):
    # Find the showtime
    result = await db.execute(
        select(Showtime)
        .where(Showtime.movie_id == data.movie_id)
        .where(Showtime.theatre_id == data.theatre_id)
        .where(Showtime.date == data.date)
        .where(Showtime.time == data.time)
    )
    showtime = result.scalars().first()
    if not showtime:
        raise HTTPException(status_code=404, detail="Showtime not found")

    # Fetch the theatre configuration
    theatre_result = await db.execute(select(Theatre).where(Theatre.id == data.theatre_id))
    theatre = theatre_result.scalars().first()
    if not theatre:
        raise HTTPException(status_code=404, detail="Theatre not found")

    # Validate and reserve seats
    for seat_label in data.seats:
        row = seat_label[0]
        col = int(seat_label[1:])

        seat_result = await db.execute(
            select(Seat)
            .where(Seat.showtime_id == showtime.id)
            .where(Seat.row == row)
            .where(Seat.col == col)
        )
        seat = seat_result.scalars().first()
        if not seat:
            raise HTTPException(status_code=400, detail=f"Seat {seat_label} not found")
        if seat.status != "available":
            raise HTTPException(
                status_code=409, detail=f"Seat {seat_label} is already {seat.status}"
            )
        seat.status = "sold"

    # Calculate total
    subtotal = len(data.seats) * theatre.ticket_price
    total = subtotal + theatre.booking_fee

    # Create ticket
    ticket = Ticket(
        id=_generate_ticket_id(),
        movie_id=data.movie_id,
        theatre_id=data.theatre_id,
        date=data.date,
        time=data.time,
        seats_json=json.dumps(data.seats),
        total=total,
        created_at=datetime.utcnow(),
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    return _ticket_to_out(ticket)
