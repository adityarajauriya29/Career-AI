from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.middleware.auth import get_current_user
from app.core.database import get_db
from app.ai.skill_gap import analyze_gap

router = APIRouter()

class GapRequest(BaseModel):
    target_role: str

@router.post("/analyze")
async def analyze(payload: GapRequest, user=Depends(get_current_user)):
    db = get_db()
    profile = await db.profiles.find_one({"user_id": user["_id"]})
    if not profile: raise HTTPException(404, "Profile not found")
    role = await db.career_roles.find_one({"name": payload.target_role})
    if not role: raise HTTPException(404, "Role not found")
    result = analyze_gap(profile.get("skills", []), role["required_skills"])
    result["target_role"] = payload.target_role
    # store latest gap
    await db.profiles.update_one({"user_id": user["_id"]},
                                 {"$set": {"latest_gap": result, "target_role": payload.target_role}})
    return result
