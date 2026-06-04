import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

# Build postgres URL if variables exist, otherwise default to sqlite
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST", "localhost")
db_port = os.getenv("DB_PORT", "5433")
db_name = os.getenv("DB_NAME")

if db_user and db_password and db_name:
    DATABASE_URL = f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
else:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./theatre.db")

# Print masked database URL
masked_url = DATABASE_URL
if db_password:
    masked_url = DATABASE_URL.replace(db_password, "****")
print(f"ℹ️ Database URL in use: {masked_url}", flush=True)

# Write to debug file
try:
    with open(str(Path(__file__).parent.parent / "db_debug.txt"), "w") as f:
        f.write(f"DATABASE_URL: {masked_url}\n")
        f.write(f"DB_USER: {db_user}\n")
        f.write(f"DB_PASSWORD: {db_password}\n")
        f.write(f"DB_HOST: {db_host}\n")
        f.write(f"DB_PORT: {db_port}\n")
        f.write(f"DB_NAME: {db_name}\n")
        f.write(f"Resolved .env Path: {str(Path(__file__).parent.parent / '.env')}\n")
        f.write(f".env exists: {str((Path(__file__).parent.parent / '.env').exists())}\n")
except Exception as e:
    pass

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    import app.models
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

