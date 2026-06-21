from fastapi import APIRouter, Depends
from app.schemas.profile import ProfileUpdate, ProfileOut
from app.middleware.auth import get_current_user
from app.core.database import get_db

router = APIRouter()

@router.get("", response_model=ProfileOut)
async def get_profile(user=Depends(get_current_user)):
    db = get_db()
    p = await db.profiles.find_one({"user_id": user["_id"]})

    if not p:
        p = {
            "user_id": user["_id"],
            "skills": [],
            "projects": [],
            "certifications": [],
            "latest_gap": None
        }
        await db.profiles.insert_one(p)

    p.pop("_id", None)
    p["name"] = user["name"]
    p["email"] = user["email"]
    return p

@router.put("", response_model=ProfileOut)
async def update_profile(payload: ProfileUpdate, user=Depends(get_current_user)):
    db = get_db()
    data = payload.dict(exclude_unset=True)

    await db.profiles.update_one(
        {"user_id": user["_id"]},
        {"$set": data},
        upsert=True
    )

    p = await db.profiles.find_one({"user_id": user["_id"]})
    p.pop("_id", None)
    p["name"] = user["name"]
    p["email"] = user["email"]
    return p