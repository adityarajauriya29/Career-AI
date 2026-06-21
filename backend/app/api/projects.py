from fastapi import APIRouter, Depends
from app.middleware.auth import get_current_user
from app.core.database import get_db
from app.core.config import settings
from groq import Groq
import json
from datetime import datetime

router = APIRouter()

client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None


FALLBACK_PROJECTS = [
    {
        "title": "Student Performance Prediction",
        "difficulty": "Beginner",
        "duration": "1 week",
        "skills": ["python", "pandas", "machine learning"],
        "description": "Predict student performance using academic and attendance data.",
        "features": ["Upload dataset", "Train ML model", "Show prediction", "Display accuracy"],
        "learning_outcome": "Learn basic ML workflow.",
        "why_recommended": "Good starter project for learning ML basics."
    },
    {
        "title": "Resume ATS Analyzer",
        "difficulty": "Intermediate",
        "duration": "2 weeks",
        "skills": ["python", "fastapi", "nlp", "react"],
        "description": "Analyze resumes and calculate ATS compatibility score.",
        "features": ["PDF upload", "Skill extraction", "ATS score", "Improvement suggestions"],
        "learning_outcome": "Learn NLP and full-stack integration.",
        "why_recommended": "Useful for improving resume parsing and career-platform features."
    },
    {
        "title": "AI Career Roadmap Generator",
        "difficulty": "Advanced",
        "duration": "3 weeks",
        "skills": ["react", "fastapi", "mongodb", "ai"],
        "description": "Generate personalized career roadmaps based on skills and target role.",
        "features": ["Profile analysis", "Skill gap", "Roadmap generation", "Progress tracking"],
        "learning_outcome": "Build an end-to-end AI platform.",
        "why_recommended": "Directly matches your AI career roadmap platform."
    }
]


def clean_json(text: str) -> str:
    return text.replace("```json", "").replace("```", "").strip()


def generate_projects_with_groq(target_role, skills, missing_skills):
    prompt = f"""
You are an AI project recommendation assistant for B.Tech CSE students.

Target Role: {target_role}
Current Skills: {", ".join(skills) or "none"}
Missing Skills: {", ".join(missing_skills) or "none"}

Generate 9 project ideas:
- 3 Beginner
- 3 Intermediate
- 3 Advanced

Return ONLY valid JSON in this format:

{{
  "target_role": "{target_role}",
  "projects": [
    {{
      "title": "",
      "difficulty": "",
      "duration": "",
      "skills": [],
      "description": "",
      "features": [],
      "learning_outcome": "",
      "why_recommended": ""
    }}
  ]
}}

Rules:
- difficulty must be Beginner, Intermediate, or Advanced.
- Include practical final-year project ideas.
- Match projects with the target role.
- Include 3 to 5 features per project.
- Keep descriptions short and clear.
- Return JSON only.
"""

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": "Return only valid JSON."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        max_tokens=2500
    )

    text = response.choices[0].message.content
    return json.loads(clean_json(text))


@router.get("/recommended")
async def recommend_projects(user=Depends(get_current_user)):
    db = get_db()
    user_id = str(user["_id"])

    profile = await db.profiles.find_one({"user_id": user_id}) or {}

    target_role = profile.get("target_role") or "Machine Learning Engineer"
    skills = profile.get("skills", [])

    latest_gap = profile.get("latest_gap", {}) or {}
    missing_skills = latest_gap.get("missing_skills", [])

    cached = await db.ai_project_recommendations.find_one({
        "user_id": user_id,
        "target_role": target_role,
        "provider": "groq"
    })

    if cached:
        cached.pop("_id", None)

        if isinstance(cached.get("created_at"), datetime):
            cached["created_at"] = cached["created_at"].isoformat()

        cached["from_cache"] = True
        return cached

    try:
        if not client:
            raise Exception("Groq API key missing")

        data = generate_projects_with_groq(
            target_role=target_role,
            skills=skills,
            missing_skills=missing_skills
        )

        data["user_id"] = user_id
        data["target_role"] = target_role
        data["provider"] = "groq"
        data["model"] = settings.GROQ_MODEL
        data["ai_used"] = True
        data["from_cache"] = False
        data["note"] = "AI project recommendations generated using Groq."
        data["created_at"] = datetime.utcnow()

        await db.ai_project_recommendations.update_one(
            {
                "user_id": user_id,
                "target_role": target_role,
                "provider": "groq"
            },
            {"$set": data},
            upsert=True
        )

        data.pop("user_id", None)
        data["created_at"] = data["created_at"].isoformat()

        return data

    except Exception as e:
        print("PROJECT RECOMMENDER ERROR:", str(e))

        return {
            "target_role": target_role,
            "projects": FALLBACK_PROJECTS,
            "provider": "fallback",
            "ai_used": False,
            "from_cache": False,
            "note": "Groq unavailable. Showing fallback project recommendations."
        }


@router.delete("/cache")
async def clear_project_cache(user=Depends(get_current_user)):
    db = get_db()
    user_id = str(user["_id"])

    await db.ai_project_recommendations.delete_many({
        "user_id": user_id
    })

    return {
        "message": "Project recommendation cache cleared"
    }