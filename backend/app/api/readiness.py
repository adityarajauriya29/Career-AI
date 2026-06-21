from fastapi import APIRouter, Depends, HTTPException
from app.middleware.auth import get_current_user
from app.core.database import get_db
from app.ai.readiness import (
    calculate_readiness,
    calculate_resume_score
)

router = APIRouter()


async def get_required_skills(db, target_role):
    if not target_role:
        return []

    role = await db.career_roles.find_one({"name": target_role})

    if not role:
        return []

    return role.get("required_skills", [])


@router.get("")
async def get_readiness(user=Depends(get_current_user)):
    db = get_db()

    user_id = str(user["_id"])

    profile = await db.profiles.find_one({"user_id": user_id})

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    target_role = profile.get("target_role")

    required_skills = await get_required_skills(
        db,
        target_role
    )

    progress_items = await db.progress.find(
        {"user_id": user_id}
    ).to_list(1000)

    completed_count = len([
        p for p in progress_items
        if p.get("completed")
    ])

    total_count = len(progress_items)

    roadmap_progress = (
        round((completed_count / total_count) * 100, 2)
        if total_count > 0
        else 0
    )

    parsed_resume = profile.get("last_resume_parse", {})

    resume_score_data = calculate_resume_score(
        parsed_resume,
        target_role=target_role,
        required_skills=required_skills
    )

    readiness_data = calculate_readiness(
        profile=profile,
        roadmap_progress=roadmap_progress,
        resume_score=resume_score_data["score"]
    )

    latest_gap = profile.get("latest_gap", {}) or {}

    return {
        "target_role": target_role or "Not Selected",

        "overall_readiness":
            readiness_data["overall_readiness"],

        "breakdown": {
            "skill_match":
                readiness_data["skill_match"],

            "project_strength":
                readiness_data["project_strength"],

            "certification_strength":
                readiness_data["certification_strength"],

            "roadmap_progress":
                readiness_data["roadmap_progress"],

            "resume_score":
                readiness_data["resume_score"]
        },

        "resume_score_details":
            resume_score_data,

        "strengths":
            resume_score_data["strengths"],

        "weaknesses":
            resume_score_data["weaknesses"],

        "recommendations":
            resume_score_data["suggestions"],

        "matched_skills":
            latest_gap.get("matched_skills", []),

        "missing_skills":
            latest_gap.get("missing_skills", []),

        "matched_resume_role_skills":
            resume_score_data.get("matched_role_skills", []),

        "missing_resume_role_skills":
            resume_score_data.get("missing_role_skills", [])
    }


@router.get("/resume-score")
async def get_resume_score(user=Depends(get_current_user)):
    db = get_db()

    user_id = str(user["_id"])

    profile = await db.profiles.find_one(
        {"user_id": user_id}
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    parsed_resume = profile.get(
        "last_resume_parse",
        {}
    )

    if not parsed_resume:
        return {
            "score": 0,
            "target_role": profile.get("target_role", "Not Selected"),
            "breakdown": {
                "skills_score": 0,
                "projects_score": 0,
                "certifications_score": 0,
                "role_match_score": 0,
                "completeness_score": 0
            },
            "matched_role_skills": [],
            "missing_role_skills": [],
            "strengths": [],
            "weaknesses": [
                "No resume uploaded yet"
            ],
            "suggestions": [
                "Upload your resume first"
            ]
        }

    target_role = profile.get("target_role")

    required_skills = await get_required_skills(
        db,
        target_role
    )

    return calculate_resume_score(
        parsed_resume,
        target_role=target_role,
        required_skills=required_skills
    )