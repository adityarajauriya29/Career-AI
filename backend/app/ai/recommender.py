"""Resource recommendation engine based on missing skills."""

import json
import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash-lite")

RESOURCE_DB = {
    "python": [
        {"type": "course", "title": "Python for Everybody (Coursera)", "url": "https://www.coursera.org/specializations/python"},
        {"type": "youtube", "title": "CodeWithHarry Python Playlist", "url": "https://youtube.com/@CodeWithHarry"},
    ],
    "machine learning": [
        {"type": "course", "title": "Andrew Ng ML (Coursera)", "url": "https://www.coursera.org/learn/machine-learning"},
        {"type": "book", "title": "Hands-On ML with Scikit-Learn & TensorFlow", "url": ""},
    ],
    "deep learning": [
        {"type": "course", "title": "DeepLearning.AI Specialization", "url": "https://www.deeplearning.ai"},
    ],
    "docker": [
        {"type": "doc", "title": "Docker Official Docs", "url": "https://docs.docker.com"},
    ],
    "react": [
        {"type": "doc", "title": "React Official Docs", "url": "https://react.dev"},
    ],
    "fastapi": [
        {"type": "doc", "title": "FastAPI Docs", "url": "https://fastapi.tiangolo.com"},
    ],
    "nlp": [
        {"type": "course", "title": "HuggingFace NLP Course", "url": "https://huggingface.co/learn/nlp-course"},
    ],
}


def clean_json(text: str):
    text = text.strip()
    text = text.replace("```json", "")
    text = text.replace("```", "")
    return text.strip()


def ai_recommend_for_skill(skill: str):
    prompt = f"""
You are an AI learning resource recommender for B.Tech CSE students.

Recommend learning resources for this skill: "{skill}"

Return ONLY valid JSON in this format:

[
  {{
    "type": "course",
    "title": "",
    "url": ""
  }},
  {{
    "type": "youtube",
    "title": "",
    "url": ""
  }},
  {{
    "type": "doc",
    "title": "",
    "url": ""
  }}
]

Rules:
- Give 3 to 5 resources.
- Use only real and commonly known learning platforms.
- Allowed types: course, youtube, doc, book, practice.
- If exact URL is not certain, keep url as empty string.
- Return JSON only.
"""

    try:
        response = model.generate_content(prompt)
        text = clean_json(response.text)
        return json.loads(text)

    except Exception:
        return [
            {
                "type": "search",
                "title": f"Search '{skill} tutorial' on YouTube/Coursera",
                "url": ""
            }
        ]


def recommend(missing_skills):
    out = {}

    for skill in missing_skills:
        key = skill.lower().strip()

        if key in RESOURCE_DB:
            out[skill] = RESOURCE_DB[key]
        else:
            out[skill] = ai_recommend_for_skill(skill)

    return out