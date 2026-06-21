from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.middleware.auth import require_role
from app.core.database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter()

class Suggestion(BaseModel):
    student_id: str
    text: str

@router.get("/students", dependencies=[Depends(require_role("mentor","admin"))])
async def list_students():
    db = get_db()
    students = await db.users.find({"role": "student"}).to_list(1000)
    out = []
    for s in students:
        prof = await db.profiles.find_one({"user_id": str(s["_id"])}) or {}
        out.append({
            "id": str(s["_id"]), "name": s["name"], "email": s["email"],
            "branch": prof.get("branch"), "year": prof.get("year"),
            "target_role": prof.get("target_role"),
            "readiness": prof.get("latest_gap", {}).get("readiness_percentage", 0),
        })
    return out

@router.get("/student/{sid}", dependencies=[Depends(require_role("mentor","admin"))])
async def student_detail(sid: str):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(sid)})
    if not user: raise HTTPException(404)
    profile = await db.profiles.find_one({"user_id": sid}) or {}
    roadmap = await db.roadmaps.find_one({"user_id": sid}) or None
    profile.pop("_id", None)
    if roadmap:
        roadmap.pop("_id", None)
        if "created_at" in roadmap: roadmap["created_at"] = roadmap["created_at"].isoformat()
    return {"user": {"id": sid, "name": user["name"], "email": user["email"]},
            "profile": profile, "roadmap": roadmap}

@router.post("/suggest", dependencies=[Depends(require_role("mentor","admin"))])
async def suggest(payload: Suggestion, user=Depends(require_role("mentor","admin"))):
    db = get_db()
    await db.mentor_suggestions.insert_one({
        "student_id": payload.student_id, "mentor_id": user["_id"],
        "text": payload.text, "created_at": datetime.utcnow()
    })
    return {"message": "Suggestion sent"}
