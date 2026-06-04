from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# ── Movies ──────────────────────────────────────────────
class MovieOut(BaseModel):
    id: str
    title: str
    genre: str
    rating: str
    runtime: str
    imdb: float
    poster: str  # full URL to poster image
    synopsis: str
    cast: list[str]
    director: str
    status: str
    release_note: Optional[str] = None
    language: str = "Hindi"

    class Config:
        from_attributes = True


class MovieListOut(BaseModel):
    movies: list[MovieOut]


# ── Theatres ────────────────────────────────────────────
class TheatreOut(BaseModel):
    id: str
    name: str
    distance: str
    city: str
    district: Optional[str] = None
    state: str = ""
    rows_count: int
    cols_count: int
    ticket_price: float
    booking_fee: float

    class Config:
        from_attributes = True



# ── Showtimes ───────────────────────────────────────────
class ShowtimeOut(BaseModel):
    id: int
    movie_id: str
    theatre_id: str
    date: str
    time: str

    class Config:
        from_attributes = True


class DateOut(BaseModel):
    label: str
    date: str


# ── Seats ───────────────────────────────────────────────
class SeatOut(BaseModel):
    id: int
    row: str
    col: int
    status: str  # available | sold | reserved

    class Config:
        from_attributes = True


class SeatMapOut(BaseModel):
    rows: list[str]
    cols: int
    seats: list[SeatOut]
    seat_price: float
    booking_fee: float


# ── Tickets ─────────────────────────────────────────────
class TicketCreate(BaseModel):
    movie_id: str
    theatre_id: str
    date: str
    time: str
    seats: list[str]  # e.g. ["A1", "A2"]


class TicketOut(BaseModel):
    id: str
    movie_id: str
    theatre_id: str
    date: str
    time: str
    seats: list[str]
    total: float
    created_at: datetime

    class Config:
        from_attributes = True


# ── Users ───────────────────────────────────────────────
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    avatar_initials: str
    films_watched: int
    hours: int
    reviews: int

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    avatar_initials: Optional[str] = None


# ── Notifications ───────────────────────────────────────
class NotificationRequest(BaseModel):
    movie_id: str


class NotificationOut(BaseModel):
    id: int
    user_id: int
    movie_id: str
    created_at: datetime

    class Config:
        from_attributes = True
