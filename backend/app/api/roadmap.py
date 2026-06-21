from fastapi import APIRouter, Depends, HTTPException
from app.schemas.roadmap import RoadmapRequest
from app.middleware.auth import get_current_user
from app.core.database import get_db
from app.ai.skill_gap import analyze_gap
from app.ai.roadmap_generator import generate_roadmap
from app.ai.recommender import recommend
from datetime import datetime

router = APIRouter()


def _flatten_skills(rm: dict) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []

    def add(val):
        if isinstance(val, str):
            s = val.strip()
            if s and s not in seen:
                seen.add(s)
                out.append(s)
        elif isinstance(val, dict):
            name = val.get("name") or val.get("skill") or val.get("title")
            if name:
                add(name)

    for key in ("skills", "topics", "all_skills"):
        for v in rm.get(key, []) or []:
            add(v)

    for group_key in (
        "roadmap",
        "months",
        "weeks",
        "phases",
        "milestones",
        "modules",
        "stages",
    ):
        for group in rm.get(group_key, []) or []:
            if not isinstance(group, dict):
                continue

            for sub_key in ("skills", "topics", "tasks", "items"):
                for v in group.get(sub_key, []) or []:
                    add(v)

    return out


def _serialize_dates(doc: dict) -> dict:
    for key in ("created_at", "updated_at"):
        if isinstance(doc.get(key), datetime):
            doc[key] = doc[key].isoformat()
    return doc


@router.post("/generate")
async def generate(payload: RoadmapRequest, user=Depends(get_current_user)):
    db = get_db()

    user_id = str(user["_id"])

    profile = await db.profiles.find_one({"user_id": user_id}) or {}
    role = await db.career_roles.find_one({"name": payload.target_role})

    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    roadmap_type = payload.roadmap_type.lower().strip()

    if roadmap_type not in ["month", "week"]:
        raise HTTPException(
            status_code=400,
            detail="roadmap_type must be either 'month' or 'week'"
        )

    # CACHE CHECK: avoid repeated Gemini calls
    cached = await db.roadmaps.find_one({
        "user_id": user_id,
        "target_role": payload.target_role,
        "roadmap_type": roadmap_type,
        "weekly_hours": payload.weekly_hours,
    })

    if cached:
        cached.pop("_id", None)
        cached.pop("user_id", None)
        cached = _serialize_dates(cached)
        cached["from_cache"] = True

        items = await db.progress.find({"user_id": user_id}).to_list(1000)
        completed_set = {
            i["skill"] for i in items if i.get("completed")
        }

        total = len(cached.get("skills", []))
        completed_count = sum(
            1 for s in cached.get("skills", []) if s in completed_set
        )

        cached["progress"] = {
            "total": total,
            "completed_count": completed_count,
            "percentage": round(100 * completed_count / total, 2) if total else 0.0,
            "completed_skills": sorted(completed_set & set(cached.get("skills", []))),
        }

        return cached

    gap = analyze_gap(
        profile.get("skills", []),
        role["required_skills"]
    )

    try:
        rm = generate_roadmap(
            target_role=payload.target_role,
            current_skills=profile.get("skills", []),
            missing_skills=gap["missing_skills"],
            weekly_hours=payload.weekly_hours,
            year_of_study=profile.get("year", 3),
            roadmap_type=roadmap_type,
            level=payload.level,
        )

        rm["ai_used"] = True
        rm["note"] = "AI roadmap generated successfully."

    except Exception as e:
        print("ROADMAP AI ERROR:", str(e))

        rm = {
            "target_role": payload.target_role,
            "level": payload.level or "auto",
            "roadmap_type": roadmap_type,
            "weekly_hours": payload.weekly_hours,
            "roadmap": [],
            "ai_used": False,
            "note": "AI quota exceeded or unavailable. Fallback roadmap used."
        }

    rm["resources"] = recommend(gap["missing_skills"])
    rm["user_id"] = user_id
    rm["created_at"] = datetime.utcnow()
    rm["updated_at"] = datetime.utcnow()
    rm["gap"] = gap
    rm["target_role"] = payload.target_role
    rm["roadmap_type"] = roadmap_type
    rm["weekly_hours"] = payload.weekly_hours
    rm["level"] = payload.level or rm.get("level", "auto")
    rm["from_cache"] = False

    flat = _flatten_skills(rm)

    if not flat:
        flat = [s for s in gap.get("missing_skills", []) if isinstance(s, str)]

    rm["skills"] = flat
    rm["total_skills"] = len(flat)

    if flat:
        await db.progress.delete_many({
            "user_id": user_id,
            "skill": {"$nin": flat},
        })

    await db.roadmaps.update_one(
        {
            "user_id": user_id,
            "target_role": payload.target_role,
            "roadmap_type": roadmap_type,
            "weekly_hours": payload.weekly_hours,
        },
        {"$set": rm},
        upsert=True,
    )

    response = rm.copy()
    response.pop("_id", None)
    response.pop("user_id", None)
    response = _serialize_dates(response)

    return response


@router.get("")
async def get_roadmap(user=Depends(get_current_user)):
    db = get_db()

    user_id = str(user["_id"])

    rm = await db.roadmaps.find_one(
        {"user_id": user_id},
        sort=[("updated_at", -1)]
    )

    if not rm:
        raise HTTPException(status_code=404, detail="No roadmap yet. Generate one.")

    rm.pop("_id", None)
    rm.pop("user_id", None)

    if not rm.get("skills"):
        rm["skills"] = _flatten_skills(rm)
        rm["total_skills"] = len(rm["skills"])

    rm = _serialize_dates(rm)

    items = await db.progress.find({"user_id": user_id}).to_list(1000)

    completed_set = {
        i["skill"] for i in items if i.get("completed")
    }

    total = len(rm.get("skills", []))
    completed_count = sum(
        1 for s in rm.get("skills", []) if s in completed_set
    )

    rm["progress"] = {
        "total": total,
        "completed_count": completed_count,
        "percentage": round(100 * completed_count / total, 2) if total else 0.0,
        "completed_skills": sorted(completed_set & set(rm.get("skills", []))),
    }

    return rm