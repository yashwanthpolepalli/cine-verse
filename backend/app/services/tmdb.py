"""
TMDb Integration Service
────────────────────────
Fetches live now playing and upcoming movies for the India (IN) region
entirely from the The Movie Database (TMDb) API.
"""

import os
import hashlib
import httpx
import json
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import Movie, Theatre, Showtime

# ─────────────────────────────────────────────────────────────────
# Credentials — read from .env
# ─────────────────────────────────────────────────────────────────
TMDB_API_URL = "https://api.themoviedb.org/3"
TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")

_last_sync: Optional[datetime] = None
SYNC_INTERVAL_SECONDS = 900  # 15 minutes


def _map_language(lang_code: str) -> str:
    lang_code = lang_code.lower().strip()
    if lang_code == "te":
        return "Telugu"
    if lang_code == "hi":
        return "Hindi"
    if lang_code == "ta":
        return "Tamil"
    if lang_code == "ml":
        return "Malayalam"
    if lang_code == "kn":
        return "Kannada"
    if lang_code == "bn":
        return "Bengali"
    if lang_code == "en":
        return "English"
    return "English"


def _map_rating(adult: bool, genres: list[str]) -> str:
    if adult:
        return "A"
    # Friendly rating defaults for family/animated genres
    for g in genres:
        if g.lower() in ("animation", "family", "adventure", "fantasy"):
            return "U"
    return "U/A"


def _runtime_str(runtime_mins: Optional[int]) -> str:
    if not runtime_mins:
        return "TBA"
    h, m = divmod(runtime_mins, 60)
    return f"{h}h {m}m" if h else f"{m}m"


async def _get(client: httpx.AsyncClient, path: str, params: dict) -> Optional[dict]:
    url = f"{TMDB_API_URL}/{path}"
    # Ensure api_key is added to parameters
    params["api_key"] = TMDB_API_KEY
    try:
        resp = await client.get(url, params=params, timeout=15.0)
        if resp.status_code == 200:
            return resp.json()
        print(f"⚠️  TMDb {path}: HTTP {resp.status_code} — {resp.text[:200]}")
    except Exception as e:
        print(f"❌  TMDb {path}: {e}")
    return None


async def sync_all_from_api(db: AsyncSession) -> int:
    """
    Synchronises live now showing and upcoming movies from the TMDb API.
    All movies and showtimes are dynamically loaded.
    """
    if not TMDB_API_KEY:
        print("❌ TMDb API: TMDB_API_KEY is not configured in your .env file! Sync aborted.", flush=True)
        return 0

    print("🔄  TMDb: Starting live sync from API...", flush=True)
    synced_movies = 0
    synced_showtimes = 0

    async with httpx.AsyncClient() as client:
        # 1. Fetch Now Playing Movies for India
        now_playing_data = await _get(client, "movie/now_playing", {"region": "IN", "page": 1})
        now_playing_results = now_playing_data.get("results", []) if now_playing_data else []

        # 2. Fetch Upcoming Movies for India
        upcoming_data = await _get(client, "movie/upcoming", {"region": "IN", "page": 1})
        upcoming_results = upcoming_data.get("results", []) if upcoming_data else []

        all_entries: list[tuple[dict, str]] = []  # (movie_basic_info, status)
        for m in now_playing_results:
            all_entries.append((m, "now"))
        for m in upcoming_results:
            all_entries.append((m, "upcoming"))

        if not all_entries:
            print("⚠️  TMDb API: No movies returned.", flush=True)
            return 0

        # Load all seeded theatres from the database
        seeded_result = await db.execute(select(Theatre).where(~Theatre.id.like("mg-cinema-%")))
        seeded_theatres = seeded_result.scalars().all()

        # Load existing showtimes from DB for deduplication
        ex_result = await db.execute(select(Showtime.movie_id, Showtime.theatre_id, Showtime.date, Showtime.time))
        existing_showtimes = set(ex_result.all())

        today = datetime.now()
        display_dates = [(today + timedelta(days=i)).strftime("%b %-d") for i in range(5)]
        std_times = ["11:30 AM", "2:45 PM", "6:15 PM", "9:30 PM"]

        upserted_movie_ids = set()

        for movie_basic, status in all_entries:
            tmdb_id = movie_basic.get("id")
            movie_db_id = f"tmdb-film-{tmdb_id}"

            if movie_db_id in upserted_movie_ids:
                continue

            # Fetch detailed movie info (genres, runtime, cast, director)
            details = await _get(client, f"movie/{tmdb_id}", {"append_to_response": "credits"})
            if not details:
                continue

            title = details.get("title", "Unknown")
            genres_list = [g.get("name", "") for g in details.get("genres", [])]
            genre = genres_list[0] if genres_list else "Drama"
            rating = _map_rating(details.get("adult", False), genres_list)
            runtime = _runtime_str(details.get("runtime"))
            imdb = round(details.get("vote_average", 0.0), 1)
            
            poster_path = details.get("poster_path")
            poster = (
                f"https://image.tmdb.org/t/p/w500{poster_path}"
                if poster_path
                else "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500"
            )
            synopsis = details.get("overview") or "No synopsis available."
            
            credits = details.get("credits", {})
            cast = [member.get("name") for member in credits.get("cast", [])[:5]]
            director = ""
            for member in credits.get("crew", []):
                if member.get("job") == "Director":
                    director = member.get("name")
                    break

            language = _map_language(details.get("original_language", "en"))

            release_note = None
            if status == "upcoming":
                rel_date_str = details.get("release_date")
                if rel_date_str:
                    try:
                        dt = datetime.strptime(rel_date_str, "%Y-%m-%d")
                        release_note = f"Opens {dt.strftime('%B %-d, %Y')} — advance booking opens soon."
                    except Exception:
                        release_note = "Coming soon — stay tuned."
                else:
                    release_note = "Coming soon — stay tuned."

            # Upsert movie
            existing_query = await db.execute(select(Movie).where(Movie.id == movie_db_id))
            existing_movie = existing_query.scalars().first()

            if existing_movie:
                existing_movie.title = title
                existing_movie.genre = genre
                existing_movie.rating = rating
                existing_movie.runtime = runtime
                existing_movie.imdb = imdb
                existing_movie.poster_filename = poster
                existing_movie.synopsis = synopsis
                existing_movie.cast_json = json.dumps(cast)
                existing_movie.director = director
                existing_movie.status = status
                existing_movie.release_note = release_note
                existing_movie.language = language
            else:
                new_movie = Movie(
                    id=movie_db_id,
                    title=title,
                    genre=genre,
                    rating=rating,
                    runtime=runtime,
                    imdb=imdb,
                    poster_filename=poster,
                    synopsis=synopsis,
                    cast_json=json.dumps(cast),
                    director=director,
                    status=status,
                    release_note=release_note,
                    language=language,
                )
                db.add(new_movie)
                synced_movies += 1

            await db.flush()
            upserted_movie_ids.add(movie_db_id)

            # Generate showtimes for seeded theatres if "now showing"
            if status == "now" and seeded_theatres:
                for theatre in seeded_theatres:
                    # Select movies to show at each theatre based on a stable hash
                    t_hash = int(hashlib.md5(theatre.id.encode()).hexdigest(), 16)
                    # Sort tmdb_id list or use tmdb_id to map
                    if (t_hash + tmdb_id) % 3 == 0:  # Assign ~1/3 of the movies to each theatre
                        for display_date in display_dates:
                            for time_str in std_times:
                                key = (movie_db_id, theatre.id, display_date, time_str)
                                if key in existing_showtimes:
                                    continue

                                showtime = Showtime(
                                    movie_id=movie_db_id,
                                    theatre_id=theatre.id,
                                    date=display_date,
                                    time=time_str,
                                )
                                db.add(showtime)
                                synced_showtimes += 1

        await db.commit()
        print(
            f"✅  TMDb sync complete: synced {synced_movies} movies, generated {synced_showtimes} showtimes.",
            flush=True,
        )
        return synced_movies


async def check_and_sync_movies(db: AsyncSession):
    """
    Triggers a TMDb sync if needed (runs in a background asyncio task).
    """
    global _last_sync
    now = datetime.now()
    if _last_sync is None or (now - _last_sync).total_seconds() > SYNC_INTERVAL_SECONDS:
        print(f"🔄  TMDb: Scheduling background sync (last: {_last_sync})", flush=True)
        _last_sync = now  # prevent double-trigger

        import asyncio
        from app.database import async_session as _make_session

        async def _background_sync():
            try:
                async with _make_session() as bg_session:
                    await sync_all_from_api(bg_session)
            except Exception as e:
                global _last_sync
                print(f"❌  TMDb: Background sync failed — {e}", flush=True)
                import traceback; traceback.print_exc()
                _last_sync = None  # allow retry on next request

        asyncio.create_task(_background_sync())
