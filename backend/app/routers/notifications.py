from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Notification, User, Movie
from app.schemas import NotificationRequest, NotificationOut

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.post("", response_model=NotificationOut, status_code=201)
async def subscribe_notification(
    data: NotificationRequest, db: AsyncSession = Depends(get_db)
):
    # Get default user
    user_result = await db.execute(select(User).limit(1))
    user = user_result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify movie exists
    movie_result = await db.execute(select(Movie).where(Movie.id == data.movie_id))
    movie = movie_result.scalars().first()
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")

    # Check if already subscribed
    existing = await db.execute(
        select(Notification)
        .where(Notification.user_id == user.id)
        .where(Notification.movie_id == data.movie_id)
    )
    if existing.scalars().first():
        raise HTTPException(status_code=409, detail="Already subscribed for notifications")

    notification = Notification(
        user_id=user.id,
        movie_id=data.movie_id,
        created_at=datetime.utcnow(),
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)

    return NotificationOut.model_validate(notification)


@router.get("", response_model=list[NotificationOut])
async def list_notifications(db: AsyncSession = Depends(get_db)):
    user_result = await db.execute(select(User).limit(1))
    user = user_result.scalars().first()
    if not user:
        return []

    result = await db.execute(
        select(Notification).where(Notification.user_id == user.id)
    )
    notifications = result.scalars().all()
    return [NotificationOut.model_validate(n) for n in notifications]
