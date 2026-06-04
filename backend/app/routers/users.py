from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User
from app.schemas import UserOut, UserUpdateRequest

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/profile", response_model=UserOut)
async def get_profile(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).limit(1))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut.model_validate(user)


@router.put("/profile", response_model=UserOut)
async def update_profile(data: UserUpdateRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).limit(1))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.name is not None:
        user.name = data.name
    if data.email is not None:
        user.email = data.email
    if data.avatar_initials is not None:
        user.avatar_initials = data.avatar_initials

    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)
