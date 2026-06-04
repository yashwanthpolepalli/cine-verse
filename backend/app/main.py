import os
from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv

from app.database import init_db, async_session
from app.seed import seed_database
from app.routers import movies, theatres, showtimes, seats, tickets, users, notifications

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed theatres/user
    try:
        await init_db()
        async with async_session() as session:
            await seed_database(session)
        print("✅ Database initialized and seeded successfully.", flush=True)
    except Exception as e:
        print(f"❌ Database initialization failed during startup: {e}", flush=True)

    # Kick off the first TMDb sync in the background so movies
    # are ready immediately without blocking the first HTTP request
    import asyncio
    from app.services.tmdb import sync_all_from_api

    async def _startup_sync():
        try:
            async with async_session() as s:
                await sync_all_from_api(s)
        except Exception as e:
            print(f"❌  Startup sync failed: {e}", flush=True)

    asyncio.create_task(_startup_sync())

    yield
    # Shutdown: nothing needed


app = FastAPI(
    title="Lumiere API",
    description="Backend API for the Lumiere movie ticketing application",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend origins (local dev + Vercel production + custom domains)
FRONTEND_URL = os.getenv("FRONTEND_URL", "")
cors_origins = [origin.strip() for origin in FRONTEND_URL.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins or ["*"],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?|https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve poster images as static files
posters_dir = Path(__file__).parent.parent / "posters"
if posters_dir.exists():
    app.mount("/posters", StaticFiles(directory=str(posters_dir)), name="posters")

# Include routers
app.include_router(movies.router)
app.include_router(theatres.router)
app.include_router(showtimes.router)
app.include_router(seats.router)
app.include_router(tickets.router)
app.include_router(users.router)
app.include_router(notifications.router)


@app.get("/")
async def root():
    return {
        "name": "Lumiere API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/api/health")
async def health():
    return {"status": "ok"}
