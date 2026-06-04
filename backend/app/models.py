import json
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Integer, Float, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class MovieStatus(str, enum.Enum):
    now = "now"
    upcoming = "upcoming"


class SeatStatus(str, enum.Enum):
    available = "available"
    sold = "sold"
    reserved = "reserved"


class Movie(Base):
    __tablename__ = "movies"

    id: Mapped[str] = mapped_column(String(100), primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    genre: Mapped[str] = mapped_column(String(50), nullable=False)
    rating: Mapped[str] = mapped_column(String(10), nullable=False)
    runtime: Mapped[str] = mapped_column(String(20), nullable=False)
    imdb: Mapped[float] = mapped_column(Float, default=0.0)
    poster_filename: Mapped[str] = mapped_column(String(200), nullable=False)
    synopsis: Mapped[str] = mapped_column(Text, nullable=False)
    cast_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    director: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(10), nullable=False, default="now")
    release_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    language: Mapped[str] = mapped_column(String(50), nullable=False, default="Hindi")

    @property
    def cast(self) -> list[str]:
        return json.loads(self.cast_json)

    @cast.setter
    def cast(self, value: list[str]):
        self.cast_json = json.dumps(value)


class Theatre(Base):
    __tablename__ = "theatres"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    distance: Mapped[str] = mapped_column(String(20), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    district: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    rows_count: Mapped[int] = mapped_column(Integer, nullable=False)
    cols_count: Mapped[int] = mapped_column(Integer, nullable=False)
    ticket_price: Mapped[float] = mapped_column(Float, nullable=False)
    booking_fee: Mapped[float] = mapped_column(Float, nullable=False)



class Showtime(Base):
    __tablename__ = "showtimes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    movie_id: Mapped[str] = mapped_column(String(100), ForeignKey("movies.id"), nullable=False)
    theatre_id: Mapped[str] = mapped_column(String(50), ForeignKey("theatres.id"), nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    time: Mapped[str] = mapped_column(String(20), nullable=False)


class Seat(Base):
    __tablename__ = "seats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    showtime_id: Mapped[int] = mapped_column(Integer, ForeignKey("showtimes.id"), nullable=False)
    row: Mapped[str] = mapped_column(String(1), nullable=False)
    col: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(10), nullable=False, default="available")


class Ticket(Base):
    __tablename__ = "tickets"

    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    movie_id: Mapped[str] = mapped_column(String(100), ForeignKey("movies.id"), nullable=False)
    theatre_id: Mapped[str] = mapped_column(String(50), ForeignKey("theatres.id"), nullable=False)
    date: Mapped[str] = mapped_column(String(20), nullable=False)
    time: Mapped[str] = mapped_column(String(20), nullable=False)
    seats_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    total: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    @property
    def seats(self) -> list[str]:
        return json.loads(self.seats_json)

    @seats.setter
    def seats(self, value: list[str]):
        self.seats_json = json.dumps(value)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False)
    avatar_initials: Mapped[str] = mapped_column(String(5), nullable=False)
    films_watched: Mapped[int] = mapped_column(Integer, default=0)
    hours: Mapped[int] = mapped_column(Integer, default=0)
    reviews: Mapped[int] = mapped_column(Integer, default=0)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    movie_id: Mapped[str] = mapped_column(String(100), ForeignKey("movies.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
