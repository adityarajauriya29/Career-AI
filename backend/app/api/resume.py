from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.middleware.auth import get_current_user
from app.core.database import get_db
from app.ai.resume_parser import parse_resume
from datetime import datetime

router = APIRouter()

MAX_BYTES = 5 * 1024 * 1024  # 5MB


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF accepted")

    content = await file.read()

    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB allowed")

    try:
        parsed = parse_resume(content)

        print("=" * 60)
        print("RESUME PARSED RESULT")
        print(parsed)
        print("=" * 60)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resume parsing failed: {str(e)}"
        )

    db = get_db()
    user_id = str(user["_id"])

    profile = await db.profiles.find_one({"user_id": user_id}) or {}

    old_skills = profile.get("skills", [])
    old_certs = profile.get("certifications", [])
    old_projects = profile.get("projects", [])

    parsed_skills = parsed.get("skills", [])
    parsed_technologies = parsed.get("technologies", [])
    parsed_certs = parsed.get("certifications", [])
    parsed_projects = parsed.get("projects", [])

    new_skills = sorted(set(old_skills + parsed_skills + parsed_technologies))
    new_certs = sorted(set(old_certs + parsed_certs))

    if isinstance(parsed_projects, list):
        new_projects = old_projects + parsed_projects
    else:
        new_projects = old_projects

    await db.profiles.update_one(
        {"user_id": user_id},
        {
            "$set": {
                "skills": new_skills,
                "certifications": new_certs,
                "projects": new_projects,
                "last_resume_parse": parsed,
                "resume_uploaded_at": datetime.utcnow(),
            }
        },
        upsert=True
    )

    return {
        "message": "Resume uploaded and analyzed successfully",
        "ai_used": parsed.get("ai_used", False),
        "note": parsed.get("note", ""),
        "raw_text_length": parsed.get("raw_text_length", 0),
        "detected_counts": {
            "skills": len(parsed_skills),
            "technologies": len(parsed_technologies),
            "certifications": len(parsed_certs),
            "projects": len(parsed_projects) if isinstance(parsed_projects, list) else 0
        },
        "analysis": parsed,
        "updated_profile": {
            "skills": new_skills,
            "certifications": new_certs,
            "projects": new_projects
        }
    }