from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional
from app.database import get_db
from app.models import Movie, Showtime, Theatre
from app.schemas import MovieOut, MovieListOut
from app.services.tmdb import check_and_sync_movies
import json

router = APIRouter(prefix="/api/movies", tags=["Movies"])


def _movie_to_out(movie: Movie, base_url: str) -> MovieOut:
    poster_url = movie.poster_filename
    if not (poster_url.startswith("http://") or poster_url.startswith("https://")):
        poster_url = f"{base_url}/posters/{movie.poster_filename}"
    return MovieOut(
        id=movie.id,
        title=movie.title,
        genre=movie.genre,
        rating=movie.rating,
        runtime=movie.runtime,
        imdb=movie.imdb,
        poster=poster_url,
        synopsis=movie.synopsis,
        cast=json.loads(movie.cast_json),
        director=movie.director,
        status=movie.status,
        release_note=movie.release_note,
        language=movie.language,
    )


def _city_showtime_filter(city: str):
    """Returns a subquery that checks if a movie has showtimes in the given city/district."""
    return (
        select(Showtime.id)
        .join(Theatre, Showtime.theatre_id == Theatre.id)
        .where(
            Showtime.movie_id == Movie.id,
            (Theatre.city == city) | (Theatre.district == city),
        )
        .exists()
    )


@router.get("", response_model=MovieListOut)
async def list_movies(
    request: Request,
    status: Optional[str] = Query(None, description="Filter by status: now | upcoming"),
    city: Optional[str] = Query(None, description="Filter by city or district"),
    language: Optional[str] = Query(None, description="Filter by language"),
    db: AsyncSession = Depends(get_db),
):
    await check_and_sync_movies(db)
    query = select(Movie)

    if status:
        query = query.where(Movie.status == status)
    if language:
        query = query.where(Movie.language == language)
    if city:
        query = query.where(
            (Movie.status == "upcoming") | _city_showtime_filter(city)
        )

    result = await db.execute(query)
    movies = result.scalars().all()
    base_url = str(request.base_url).rstrip("/")
    return MovieListOut(movies=[_movie_to_out(m, base_url) for m in movies])


@router.get("/featured", response_model=MovieOut)
async def get_featured(
    request: Request,
    city: Optional[str] = Query(None, description="Filter by city or district"),
    db: AsyncSession = Depends(get_db),
):
    await check_and_sync_movies(db)
    query = select(Movie).where(Movie.status == "now")
    if city:
        query = query.where(_city_showtime_filter(city))

    result = await db.execute(query.limit(1))
    movie = result.scalars().first()
    if not movie:
        result = await db.execute(select(Movie).where(Movie.status == "now").limit(1))
        movie = result.scalars().first()
    if not movie:
        raise HTTPException(status_code=404, detail="No featured movie found")
    base_url = str(request.base_url).rstrip("/")
    return _movie_to_out(movie, base_url)


@router.get("/trending", response_model=MovieListOut)
async def get_trending(
    request: Request,
    city: Optional[str] = Query(None, description="City or district"),
    limit: int = Query(5, description="Max results"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns movies ranked by number of showtimes (most showtimes = trending / now booking).
    If city is provided, counts showtimes only in that city/district.
    """
    await check_and_sync_movies(db)

    # Count showtimes per movie, optionally scoped to city
    count_query = (
        select(Showtime.movie_id, func.count(Showtime.id).label("cnt"))
        .join(Theatre, Showtime.theatre_id == Theatre.id)
    )
    if city:
        count_query = count_query.where(
            (Theatre.city == city) | (Theatre.district == city)
        )
    count_query = (
        count_query
        .group_by(Showtime.movie_id)
        .order_by(func.count(Showtime.id).desc())
        .limit(limit)
    )

    result = await db.execute(count_query)
    rows = result.all()
    movie_ids = [r[0] for r in rows]

    if not movie_ids:
        return MovieListOut(movies=[])

    # Fetch those movies preserving rank order
    movies_result = await db.execute(
        select(Movie).where(Movie.id.in_(movie_ids)).where(Movie.status == "now")
    )
    movies_by_id = {m.id: m for m in movies_result.scalars().all()}
    ordered = [movies_by_id[mid] for mid in movie_ids if mid in movies_by_id]

    base_url = str(request.base_url).rstrip("/")
    return MovieListOut(movies=[_movie_to_out(m, base_url) for m in ordered])


@router.get("/search", response_model=MovieListOut)
async def search_movies(
    request: Request,
    q: str = Query("", description="Search query"),
    genre: str = Query("All", description="Genre filter"),
    language: Optional[str] = Query(None, description="Language filter"),
    city: Optional[str] = Query(None, description="Filter by city or district"),
    db: AsyncSession = Depends(get_db),
):
    await check_and_sync_movies(db)
    query = select(Movie)
    if city:
        query = query.where(
            (Movie.status == "upcoming") | _city_showtime_filter(city)
        )
    if language:
        query = query.where(Movie.language == language)

    result = await db.execute(query)
    movies = result.scalars().all()

    filtered = []
    for m in movies:
        match_q = q.strip() == "" or q.lower() in m.title.lower()
        match_g = genre == "All" or m.genre == genre
        if match_q and match_g:
            filtered.append(m)

    base_url = str(request.base_url).rstrip("/")
    return MovieListOut(movies=[_movie_to_out(m, base_url) for m in filtered])


@router.get("/{movie_id}", response_model=MovieOut)
async def get_movie(
    movie_id: str, request: Request, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Movie).where(Movie.id == movie_id))
    movie = result.scalars().first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    base_url = str(request.base_url).rstrip("/")
    return _movie_to_out(movie, base_url)
