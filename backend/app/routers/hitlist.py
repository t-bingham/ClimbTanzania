from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.base import get_db
from app.schemas.add_climb import HitlistCreate, Hitlist
from app.models.add_climb import Hitlist as HitlistModel, User as UserModel
from app.auth import get_current_user

hitlist_router = APIRouter()

@hitlist_router.post("/", response_model=Hitlist)
async def add_to_hitlist(
    climb_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    hitlist_entry = HitlistModel(user_id=current_user.id, climb_id=climb_id)
    db.add(hitlist_entry)
    db.commit()
    db.refresh(hitlist_entry)
    return hitlist_entry
