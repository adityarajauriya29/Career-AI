from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.middleware.auth import get_current_user
from app.core.database import get_db
from datetime import datetime

router = APIRouter()


class ProgressUpdate(BaseModel):
    skill: str
    completed: bool


async def _get_roadmap_skills(db, user_id) -> list[str]:
    """
    Return the flat list of skill names from the user's latest roadmap.
    Adjust the collection name / shape if your roadmap is stored differently.
    Expected roadmap doc shape (example):
      { user_id, skills: ["Python", "FastAPI", ...], created_at }
    OR grouped:
      { user_id, phases: [{ skills: ["Python", ...] }, ...] }
    """
    roadmap = await db.roadmaps.find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)],
    )
    if not roadmap:
        return []

    # Flat list
    if isinstance(roadmap.get("skills"), list):
        return [s for s in roadmap["skills"] if isinstance(s, str)]

    # Grouped by phases
    skills: list[str] = []
    for phase in roadmap.get("phases", []) or []:
        for s in phase.get("skills", []) or []:
            if isinstance(s, str):
                skills.append(s)
    return skills


@router.post("/update")
async def update_progress(
    payload: ProgressUpdate,
    user=Depends(get_current_user),
):
    if not payload.skill or not payload.skill.strip():
        raise HTTPException(status_code=400, detail="Skill is required")

    db = get_db()
    await db.progress.update_one(
        {"user_id": user["_id"], "skill": payload.skill},
        {
            "$set": {
                "completed": payload.completed,
                "updated_at": datetime.utcnow(),
            },
            "$setOnInsert": {
                "user_id": user["_id"],
                "skill": payload.skill,
                "created_at": datetime.utcnow(),
            },
        },
        upsert=True,
    )
    return {"message": "Updated", "skill": payload.skill, "completed": payload.completed}


@router.get("")
async def get_progress(user=Depends(get_current_user)):
    db = get_db()

    # 1. All progress docs for this user
    items = await db.progress.find({"user_id": user["_id"]}).to_list(1000)
    for i in items:
        i.pop("_id", None)
        i.pop("user_id", None)
        if isinstance(i.get("updated_at"), datetime):
            i["updated_at"] = i["updated_at"].isoformat()
        if isinstance(i.get("created_at"), datetime):
            i["created_at"] = i["created_at"].isoformat()

    # 2. The TRUE total = number of skills in the user's roadmap
    roadmap_skills = await _get_roadmap_skills(db, user["_id"])
    total = len(roadmap_skills)

    # 3. Only count skills that are BOTH in the roadmap AND marked completed
    completed_set = {i["skill"] for i in items if i.get("completed")}
    if total > 0:
        completed_count = sum(1 for s in roadmap_skills if s in completed_set)
        percentage = round(100 * completed_count / total, 2)
    else:
        # Fallback: no roadmap yet — use raw items
        completed_count = len(completed_set)
        percentage = 0.0

    return {
        "items": items,
        "skills": roadmap_skills,          # NEW — frontend can render badges directly
        "completed_skills": sorted(completed_set & set(roadmap_skills)),
        "total": total,                    # now = roadmap size, not items count
        "completed_count": completed_count,
        "percentage": percentage,
    }
