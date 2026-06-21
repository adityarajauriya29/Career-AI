from fastapi import APIRouter, Depends
from app.middleware.auth import require_role
from app.core.database import get_db
from collections import Counter

router = APIRouter()

@router.get("/overview", dependencies=[Depends(require_role("placement_officer","admin"))])
async def overview():
    db = get_db()
    students = await db.users.find({"role": "student"}).to_list(2000)
    profiles = await db.profiles.find().to_list(2000)
    profile_map = {p["user_id"]: p for p in profiles}
    branches = Counter()
    skill_counter = Counter()
    readiness_buckets = {"0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0}
    total_readiness = 0; counted = 0
    for s in students:
        p = profile_map.get(str(s["_id"]), {})
        if p.get("branch"): branches[p["branch"]] += 1
        for sk in p.get("skills", []): skill_counter[sk] += 1
        r = p.get("latest_gap", {}).get("readiness_percentage")
        if r is not None:
            total_readiness += r; counted += 1
            if r <= 25: readiness_buckets["0-25"] += 1
            elif r <= 50: readiness_buckets["26-50"] += 1
            elif r <= 75: readiness_buckets["51-75"] += 1
            else: readiness_buckets["76-100"] += 1
    return {
        "total_students": len(students),
        "average_readiness": round(total_readiness / max(counted, 1), 2),
        "branches": dict(branches),
        "top_skills": skill_counter.most_common(15),
        "readiness_distribution": readiness_buckets,
    }
