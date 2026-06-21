from fastapi import APIRouter, Depends, HTTPException
from app.schemas.role import CareerRole
from app.middleware.auth import get_current_user, require_role
from app.core.database import get_db
from app.core.config import settings
from groq import Groq
import json
from datetime import datetime

router = APIRouter()

client = Groq(api_key=settings.GROQ_API_KEY)

DEFAULT_ROLES = [
    {"name": "AI Engineer", "description": "Builds AI/ML systems end-to-end.",
     "required_skills": ["python", "machine learning", "deep learning", "pytorch", "nlp", "docker", "fastapi"],
     "difficulty": "Advanced", "duration_months": 8,
     "recommended_projects": ["Chatbot with RAG", "Image classifier", "MLOps pipeline"]},

    {"name": "Machine Learning Engineer", "description": "Ships ML models in production.",
     "required_skills": ["python", "scikit-learn", "tensorflow", "docker", "aws", "sql"],
     "difficulty": "Advanced", "duration_months": 7,
     "recommended_projects": ["Recommendation system", "Fraud detection"]},

    {"name": "Data Scientist", "description": "Extracts insight from data.",
     "required_skills": ["python", "statistics", "pandas", "sql", "machine learning", "tableau"],
     "difficulty": "Intermediate", "duration_months": 6,
     "recommended_projects": ["Customer churn analysis", "Kaggle competition"]},

    {"name": "Data Analyst", "description": "Reports and dashboards.",
     "required_skills": ["sql", "excel", "power bi", "tableau", "python", "statistics"],
     "difficulty": "Beginner", "duration_months": 4,
     "recommended_projects": ["Sales dashboard"]},

    {"name": "MLOps Engineer", "description": "Productionizes ML.",
     "required_skills": ["docker", "kubernetes", "ci/cd", "airflow", "aws", "python"],
     "difficulty": "Advanced", "duration_months": 7,
     "recommended_projects": ["Model serving pipeline"]},

    {"name": "GenAI Engineer", "description": "Builds with LLMs and RAG.",
     "required_skills": ["python", "llm", "langchain", "huggingface", "fastapi", "vector db"],
     "difficulty": "Advanced", "duration_months": 6,
     "recommended_projects": ["RAG knowledge bot", "AI agent"]},

    {"name": "Full Stack AI Developer", "description": "Full stack apps with AI features.",
     "required_skills": ["javascript", "react", "fastapi", "mongodb", "docker", "openai", "gemini"],
     "difficulty": "Intermediate", "duration_months": 6,
     "recommended_projects": ["AI SaaS MVP"]},

    {"name": "Software Engineer", "description": "General SDE role.",
     "required_skills": ["dsa", "java", "python", "sql", "git", "system design"],
     "difficulty": "Intermediate", "duration_months": 6,
     "recommended_projects": ["URL shortener", "Chat app"]},
]


def clean_json(text: str) -> str:
    text = text.strip()
    text = text.replace("```json", "")
    text = text.replace("```", "")
    return text.strip()


def generate_roles_with_groq(target_role: str):
    prompt = f"""
You are an expert AI career advisor.

The student's selected target role is: {target_role}

Generate valid, realistic, industry-relevant career roles related to this target role.

Return ONLY valid JSON in this exact format:

{{
  "target_role": "{target_role}",
  "recommended_roles": [
    {{
      "name": "",
      "description": "",
      "required_skills": [],
      "difficulty": "",
      "duration_months": 0,
      "recommended_projects": []
    }}
  ]
}}

Rules:
- Generate 6 to 10 related roles.
- Do not generate fake roles.
- Use only real career roles available in the industry.
- required_skills must contain lowercase skill names.
- difficulty must be Beginner, Intermediate, or Advanced.
- duration_months must be a number.
- recommended_projects must contain 2 to 3 project ideas.
- Return JSON only.
"""

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a career advisor. Return only valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.4,
        max_tokens=1500
    )

    text = response.choices[0].message.content
    text = clean_json(text)

    return json.loads(text)


@router.get("")
async def list_roles():
    db = get_db()
    roles = await db.career_roles.find().to_list(100)

    if not roles:
        await db.career_roles.insert_many(DEFAULT_ROLES)
        roles = await db.career_roles.find().to_list(100)

    for r in roles:
        r.pop("_id", None)

    return roles


@router.get("/ai/recommended")
async def get_ai_recommended_roles(current_user=Depends(get_current_user)):
    db = get_db()

    user_id = str(
        current_user.get("_id") or
        current_user.get("id") or
        current_user.get("user_id")
    )

    email = current_user.get("email")

    profile = await db.profiles.find_one({"user_id": user_id})

    if not profile:
        profile = await db.profiles.find_one({"user_id": current_user.get("_id")})

    if not profile:
        profile = await db.student_profiles.find_one({"user_id": user_id})

    if not profile:
        profile = await db.student_profiles.find_one({"email": email})

    if not profile:
        target_role = "Machine Learning Engineer"
    else:
        target_role = (
            profile.get("target_role") or
            profile.get("targetRole") or
            profile.get("target") or
            "Machine Learning Engineer"
        )

    cached = await db.ai_role_recommendations.find_one({
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
        data = generate_roles_with_groq(target_role)

        data["user_id"] = user_id
        data["target_role"] = target_role
        data["provider"] = "groq"
        data["model"] = settings.GROQ_MODEL
        data["ai_used"] = True
        data["from_cache"] = False
        data["note"] = "AI career roles generated successfully using Groq."
        data["created_at"] = datetime.utcnow()

        await db.ai_role_recommendations.update_one(
            {
                "user_id": user_id,
                "target_role": target_role,
                "provider": "groq"
            },
            {
                "$set": data
            },
            upsert=True
        )

        data.pop("user_id", None)
        data["created_at"] = data["created_at"].isoformat()

        return data

    except Exception as e:
        print("GROQ ROLE ERROR:", str(e))

        return {
            "target_role": target_role,
            "recommended_roles": DEFAULT_ROLES,
            "provider": "fallback",
            "ai_used": False,
            "from_cache": False,
            "note": "Groq unavailable or API limit reached. Showing default career roles."
        }


@router.get("/{name}")
async def get_role(name: str):
    db = get_db()
    role = await db.career_roles.find_one({"name": name})

    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    role.pop("_id", None)
    return role


@router.post("", dependencies=[Depends(require_role("admin"))])
async def create_role(role: CareerRole):
    db = get_db()

    await db.career_roles.update_one(
        {"name": role.name},
        {"$set": role.dict()},
        upsert=True
    )

    return {
        "message": "Saved",
        "role": role
    }