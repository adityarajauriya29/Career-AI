"""AI-powered roadmap generator. Uses Groq if available, else rule-based fallback."""

import json
from typing import List, Dict
from app.core.config import settings

try:
    from groq import Groq

    if settings.GROQ_API_KEY:
        _GROQ_CLIENT = Groq(api_key=settings.GROQ_API_KEY)
    else:
        _GROQ_CLIENT = None
except Exception:
    _GROQ_CLIENT = None


ROLE_PATHS = {
    "AI Engineer": [
        ("Python & Math Foundations", ["python", "linear algebra", "statistics"]),
        ("Data Structures & Algorithms", ["dsa", "problem solving"]),
        ("Data Analysis", ["pandas", "numpy", "matplotlib"]),
        ("Classical ML", ["scikit-learn", "regression", "classification"]),
        ("Deep Learning", ["pytorch", "tensorflow", "cnn", "rnn"]),
        ("NLP & LLMs", ["transformers", "huggingface", "langchain"]),
        ("MLOps", ["docker", "fastapi", "ci/cd"]),
        ("Capstone Project", ["end-to-end ai project"]),
    ],
    "Machine Learning Engineer": [
        ("Python & Math Foundations", ["python", "linear algebra", "statistics", "probability"]),
        ("Data Handling", ["numpy", "pandas", "matplotlib"]),
        ("Machine Learning Basics", ["scikit-learn", "regression", "classification"]),
        ("Model Evaluation", ["model evaluation", "cross validation", "metrics"]),
        ("Deep Learning", ["tensorflow", "pytorch", "neural networks"]),
        ("Deployment", ["fastapi", "docker", "aws"]),
        ("MLOps Basics", ["mlops", "ci/cd", "model monitoring"]),
        ("Capstone Project", ["end-to-end ml project"]),
    ],
    "Data Scientist": [
        ("Python & Statistics", ["python", "statistics"]),
        ("SQL & Data Wrangling", ["sql", "pandas"]),
        ("Visualization", ["matplotlib", "seaborn", "tableau"]),
        ("Machine Learning", ["scikit-learn"]),
        ("Feature Engineering", ["feature engineering"]),
        ("Time Series & A/B Testing", ["time series", "ab testing"]),
        ("Capstone", ["kaggle-style project"]),
    ],
    "Full Stack AI Developer": [
        ("JavaScript & React", ["javascript", "react"]),
        ("Backend with Node/FastAPI", ["fastapi", "rest api"]),
        ("Databases", ["mongodb", "postgresql"]),
        ("Auth & Deployment", ["jwt", "docker"]),
        ("AI Integration", ["openai", "gemini", "langchain"]),
        ("Capstone Full Stack AI app", ["end-to-end project"]),
    ],
}


def _pick_level(weekly_hours: int) -> str:
    if weekly_hours < 7:
        return "beginner"
    if weekly_hours < 15:
        return "intermediate"
    return "advanced"


def _clean_json(text: str) -> str:
    text = text.strip()
    text = text.replace("```json", "")
    text = text.replace("```", "")
    return text.strip()


def _fallback_roadmap(
    target_role: str,
    weekly_hours: int,
    missing_skills: List[str],
    roadmap_type: str = "month"
) -> List[Dict]:

    path = ROLE_PATHS.get(target_role, ROLE_PATHS["AI Engineer"])
    roadmap = []

    if roadmap_type == "week":
        total_steps = 12
        unit = "Week"
    else:
        total_steps = 6
        unit = "Month"

    for i in range(1, total_steps + 1):
        topic, skills = path[(i - 1) % len(path)]

        roadmap.append({
            "title": f"{unit} {i}",
            "focus": topic,
            "topics": skills,
            "tasks": [
                f"Study {topic}",
                f"Practice skills: {', '.join(skills[:3])}",
                "Make notes and revise important concepts"
            ],
            "resources": [
                f"Search: {skills[0]} course",
                f"Search: {skills[-1]} tutorial"
            ],
            "project": f"Mini project on {topic}",
            "outcome": f"Understand and apply {topic}"
        })

    return roadmap


def _generate_with_groq(prompt: str) -> Dict:
    response = _GROQ_CLIENT.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are an expert AI career coach. Return only valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.4,
        max_tokens=2500
    )

    text = response.choices[0].message.content
    text = _clean_json(text)

    return json.loads(text)


def generate_roadmap(
    target_role: str,
    current_skills: List[str],
    missing_skills: List[str],
    weekly_hours: int = 10,
    year_of_study: int = 3,
    roadmap_type: str = "month",
    level: str | None = None,
) -> Dict:

    roadmap_type = roadmap_type.lower().strip()

    if roadmap_type not in ["month", "week"]:
        roadmap_type = "month"

    final_level = level or _pick_level(weekly_hours)

    if roadmap_type == "week":
        duration_instruction = "Generate exactly 12 roadmap steps from Week 1 to Week 12."
        unit_name = "Week"
    else:
        duration_instruction = "Generate exactly 6 roadmap steps from Month 1 to Month 6."
        unit_name = "Month"

    prompt = f"""
You are an expert AI career coach for B.Tech CSE students.

Create a personalized learning roadmap.

Student Details:
- Target Role: {target_role}
- Current Skills: {", ".join(current_skills) or "none"}
- Missing Skills: {", ".join(missing_skills) or "none"}
- Weekly Study Hours: {weekly_hours}
- Year of Study: {year_of_study}
- Level: {final_level}
- Roadmap Type: {roadmap_type}

{duration_instruction}

Return ONLY valid JSON in this exact format:

{{
  "roadmap": [
    {{
      "title": "{unit_name} 1",
      "focus": "",
      "topics": [],
      "tasks": [],
      "resources": [],
      "project": "",
      "outcome": ""
    }}
  ]
}}

Rules:
- If roadmap type is month, use titles Month 1 to Month 6.
- If roadmap type is week, use titles Week 1 to Week 12.
- Focus mainly on missing skills first.
- Keep it suitable for a B.Tech CSE final-year student.
- Include practical tasks.
- Include project-based learning.
- resources must be simple text resource suggestions.
- Return JSON only.
"""

    if _GROQ_CLIENT:
        try:
            data = _generate_with_groq(prompt)

            return {
                "target_role": target_role,
                "level": final_level,
                "roadmap_type": roadmap_type,
                "weekly_hours": weekly_hours,
                "roadmap": data.get("roadmap", []),
                "ai_used": True,
                "provider": "groq",
                "model": settings.GROQ_MODEL,
                "note": "AI roadmap generated using Groq."
            }

        except Exception as e:
            print(f"[roadmap groq] fallback due to: {e}")

    return {
        "target_role": target_role,
        "level": final_level,
        "roadmap_type": roadmap_type,
        "weekly_hours": weekly_hours,
        "roadmap": _fallback_roadmap(
            target_role=target_role,
            weekly_hours=weekly_hours,
            missing_skills=missing_skills,
            roadmap_type=roadmap_type
        ),
        "ai_used": False,
        "provider": "fallback",
        "note": "Groq unavailable or API limit reached. Fallback roadmap used."
    }