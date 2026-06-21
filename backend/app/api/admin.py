from fastapi import APIRouter, Depends
from app.middleware.auth import require_role
from app.core.database import get_db

router = APIRouter()


@router.get("/stats", dependencies=[Depends(require_role("admin"))])
async def stats():
    db = get_db()

    return {
        "users": await db.users.count_documents({
            "role": {"$in": ["student", "admin"]}
        }),
        "students": await db.users.count_documents({
            "role": "student"
        }),
        "admins": await db.users.count_documents({
            "role": "admin"
        }),
        "profiles": await db.profiles.count_documents({}),
        "roles": await db.career_roles.count_documents({}),
        "roadmaps": await db.roadmaps.count_documents({}),
        "resume_uploads": await db.profiles.count_documents({
            "last_resume_parse": {"$exists": True}
        }),
    }


@router.get("/users", dependencies=[Depends(require_role("admin"))])
async def list_users():
    db = get_db()

    users = await db.users.find(
        {
            "role": {
                "$in": ["student", "admin"]
            }
        },
        {
            "password": 0
        }
    ).to_list(2000)

    for u in users:
        u["_id"] = str(u["_id"])

        if "created_at" in u:
            u["created_at"] = u["created_at"].isoformat()

    return users