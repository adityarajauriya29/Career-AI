from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.middleware.auth import get_current_user
from app.core.database import get_db
from app.core.config import settings
from groq import Groq
from datetime import datetime
import json

router = APIRouter()

client = Groq(api_key=settings.GROQ_API_KEY) if settings.GROQ_API_KEY else None


class EvaluateRequest(BaseModel):
    question: str
    answer: str
    target_role: str | None = None


def clean_json(text: str) -> str:
    return text.replace("```json", "").replace("```", "").strip()


@router.get("/questions")
async def generate_questions(user=Depends(get_current_user)):
    db = get_db()
    user_id = str(user["_id"])

    profile = await db.profiles.find_one({"user_id": user_id}) or {}
    target_role = profile.get("target_role") or "Machine Learning Engineer"
    skills = profile.get("skills", [])

    prompt = f"""
Generate mock interview questions for a B.Tech CSE student.

Target Role: {target_role}
Student Skills: {", ".join(skills) or "none"}

Return ONLY valid JSON:

{{
  "target_role": "{target_role}",
  "questions": [
    {{
      "type": "Technical",
      "question": "",
      "difficulty": ""
    }}
  ]
}}

Rules:
- Generate 10 questions.
- Include Technical, Project-Based, HR, and Behavioral questions.
- difficulty must be Easy, Medium, or Hard.
- Return JSON only.
"""

    try:
        if not client:
            raise Exception("Groq API key missing")

        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=1800
        )

        data = json.loads(clean_json(response.choices[0].message.content))

        data["provider"] = "groq"
        data["ai_used"] = True
        data["note"] = "Mock interview questions generated using Groq."

        return data

    except Exception as e:
        print("MOCK INTERVIEW ERROR:", str(e))

        return {
            "target_role": target_role,
            "provider": "fallback",
            "ai_used": False,
            "note": "Groq unavailable. Showing fallback questions.",
            "questions": [
                {"type": "Technical", "question": "What is overfitting in machine learning?", "difficulty": "Easy"},
                {"type": "Technical", "question": "Explain train-test split.", "difficulty": "Easy"},
                {"type": "Project-Based", "question": "Explain one project from your resume.", "difficulty": "Medium"},
                {"type": "Project-Based", "question": "What challenges did you face in your project?", "difficulty": "Medium"},
                {"type": "HR", "question": "Tell me about yourself.", "difficulty": "Easy"},
                {"type": "HR", "question": "Why should we hire you?", "difficulty": "Medium"}
            ]
        }


@router.post("/evaluate")
async def evaluate_answer(payload: EvaluateRequest, user=Depends(get_current_user)):
    db = get_db()
    user_id = str(user["_id"])

    profile = await db.profiles.find_one({"user_id": user_id}) or {}
    target_role = payload.target_role or profile.get("target_role") or "Machine Learning Engineer"

    prompt = f"""
Evaluate this mock interview answer.

Target Role: {target_role}

Question:
{payload.question}

Student Answer:
{payload.answer}

Return ONLY valid JSON:

{{
  "score": 0,
  "strengths": [],
  "improvements": [],
  "ideal_answer": "",
  "feedback": ""
}}

Rules:
- score must be out of 10.
- Give practical feedback.
- Keep ideal_answer concise.
- Return JSON only.
"""

    try:
        if not client:
            raise Exception("Groq API key missing")

        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {"role": "system", "content": "You are an interview evaluator. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1200
        )

        data = json.loads(clean_json(response.choices[0].message.content))

        await db.mock_interviews.insert_one({
            "user_id": user_id,
            "target_role": target_role,
            "question": payload.question,
            "answer": payload.answer,
            "evaluation": data,
            "created_at": datetime.utcnow()
        })

        return data

    except Exception as e:
        print("MOCK EVALUATION ERROR:", str(e))

        return {
            "score": 0,
            "strengths": [],
            "improvements": ["AI evaluation unavailable. Try again later."],
            "ideal_answer": "",
            "feedback": "Groq unavailable or API limit reached."
        }