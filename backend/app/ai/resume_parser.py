"""AI-powered resume PDF parser using PyPDF + Groq + fallback keyword matching."""

import re
import json
from io import BytesIO
from pypdf import PdfReader
from app.core.config import settings

try:
    from groq import Groq

    if settings.GROQ_API_KEY:
        _GROQ_CLIENT = Groq(api_key=settings.GROQ_API_KEY)
    else:
        _GROQ_CLIENT = None
except Exception:
    _GROQ_CLIENT = None


SKILL_DB = {
    "python", "java", "c++", "c", "javascript", "typescript", "go", "rust", "sql",
    "react", "angular", "vue", "next.js", "node.js", "express", "fastapi", "django", "flask",
    "mongodb", "postgresql", "mysql", "redis", "elasticsearch",
    "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd", "git", "github", "linux",
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras", "scikit-learn",
    "sklearn", "nlp", "computer vision", "data analysis", "pandas", "numpy",
    "matplotlib", "seaborn", "plotly",
    "tableau", "power bi", "powerbi", "excel", "statistics", "probability",
    "html", "css", "tailwind", "tailwind css", "bootstrap", "rest api", "api",
    "graphql", "websockets",
    "llm", "generative ai", "langchain", "huggingface", "openai", "gemini", "rag",
    "mlops", "airflow", "kafka", "spark", "hadoop",
    "mern", "node", "nodejs", "express.js", "mongodb atlas", "vite",
    "jwt", "firebase", "opencv", "jupyter", "anaconda", "vs code",
    "fast api", "streamlit", "flask api", "supabase", "dbms",
    "data structures", "algorithms", "computer networks"
}

ALIASES = {
    "nodejs": "node.js",
    "node": "node.js",
    "express.js": "express",
    "fast api": "fastapi",
    "powerbi": "power bi",
    "sklearn": "scikit-learn",
    "tailwind css": "tailwind",
    "mongodb atlas": "mongodb",
    "vs code": "visual studio code",
}

CERT_KEYWORDS = [
    "certified", "certification", "certificate", "nptel",
    "coursera", "udemy", "infosys springboard", "great learning",
    "simplilearn", "google", "microsoft", "aws academy"
]

PROJECT_KEYWORDS = [
    "project", "projects", "developed", "built", "implemented",
    "designed", "created", "made", "application", "system", "platform"
]


def extract_text(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    text = "\n".join((p.extract_text() or "") for p in reader.pages)
    text = text.replace("\x00", " ")
    return text.strip()


def normalize_text(text: str) -> str:
    text = text.lower()
    text = text.replace("c++", "cplusplus")
    text = text.replace("c#", "csharp")
    text = re.sub(r"[^a-z0-9+#./\-\s]", " ", text)
    text = text.replace("cplusplus", "c++")
    text = text.replace("csharp", "c#")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def clean_json(text: str) -> str:
    text = text.strip()
    text = text.replace("```json", "")
    text = text.replace("```", "")
    return text.strip()


def normalize_skill(skill: str) -> str:
    skill = skill.lower().strip()
    return ALIASES.get(skill, skill)


def detect_skills(text: str):
    t = normalize_text(text)
    found = set()

    for skill in SKILL_DB:
        normalized_skill = normalize_text(skill)

        if (
            " " in normalized_skill
            or "." in normalized_skill
            or "-" in normalized_skill
            or "+" in normalized_skill
        ):
            if normalized_skill in t:
                found.add(normalize_skill(skill))
        else:
            if re.search(rf"\b{re.escape(normalized_skill)}\b", t):
                found.add(normalize_skill(skill))

    return sorted(found)


def detect_certifications(text: str):
    certs = []

    for line in text.split("\n"):
        l = line.strip()

        if any(k in l.lower() for k in CERT_KEYWORDS) and 5 < len(l) < 220:
            certs.append(l)

    return certs[:20]


def detect_projects(text: str):
    projects = []
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    for line in lines:
        lower = line.lower()

        if any(k in lower for k in PROJECT_KEYWORDS) and 10 < len(line) < 250:
            projects.append({
                "title": line[:80],
                "description": line,
                "technologies": detect_skills(line)
            })

    return projects[:15]


def fallback_parse(text: str) -> dict:
    skills = detect_skills(text)
    projects = detect_projects(text)

    return {
        "ai_used": False,
        "provider": "local",
        "note": "Groq unavailable. Resume analyzed using local parser.",
        "raw_text_length": len(text),
        "skills": skills,
        "technologies": skills,
        "certifications": detect_certifications(text),
        "projects": projects,
        "experience": [],
        "education": [],
        "summary": "Resume parsed successfully using local keyword-based analysis."
    }


def ai_parse_resume(text: str) -> dict:
    prompt = f"""
You are an AI resume analyzer for a B.Tech CSE career roadmap platform.

Analyze the resume text below and extract structured information.

Resume Text:
{text[:12000]}

Return ONLY valid JSON in this exact format:

{{
  "skills": [],
  "technologies": [],
  "certifications": [],
  "projects": [
    {{
      "title": "",
      "description": "",
      "technologies": []
    }}
  ],
  "experience": [],
  "education": [],
  "summary": ""
}}

Rules:
- Extract only information actually present in the resume.
- Do not invent fake skills, projects, certifications, experience, or education.
- skills must be lowercase.
- technologies must be lowercase.
- Keep project descriptions short.
- If something is not found, return an empty list.
- Return JSON only.
"""

    response = _GROQ_CLIENT.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a resume parser. Return only valid JSON."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.2,
        max_tokens=2000
    )

    text_response = response.choices[0].message.content
    text_response = clean_json(text_response)

    data = json.loads(text_response)

    data["raw_text_length"] = len(text)

    data["skills"] = sorted(set([
        normalize_skill(str(s))
        for s in data.get("skills", [])
        if str(s).strip()
    ]))

    data["technologies"] = sorted(set([
        normalize_skill(str(s))
        for s in data.get("technologies", [])
        if str(s).strip()
    ]))

    data["ai_used"] = True
    data["provider"] = "groq"
    data["model"] = settings.GROQ_MODEL
    data["note"] = "Resume analyzed using Groq AI."

    # Extra safety: merge AI skills with local detected skills
    local_skills = detect_skills(text)
    data["skills"] = sorted(set(data.get("skills", []) + local_skills))
    data["technologies"] = sorted(set(data.get("technologies", []) + local_skills))

    return data


def parse_resume(file_bytes: bytes) -> dict:
    text = extract_text(file_bytes)

    print("=" * 60)
    print("RESUME TEXT LENGTH:", len(text))
    print("RESUME TEXT PREVIEW:")
    print(text[:1000])
    print("=" * 60)

    if not text.strip():
        return {
            "ai_used": False,
            "provider": "none",
            "note": "No readable text found in PDF. The resume may be scanned/image-based.",
            "raw_text_length": 0,
            "skills": [],
            "technologies": [],
            "certifications": [],
            "projects": [],
            "experience": [],
            "education": [],
            "summary": "No readable text found in PDF."
        }

    if _GROQ_CLIENT:
        try:
            return ai_parse_resume(text)
        except Exception as e:
            print(f"[resume groq ai] fallback due to: {e}")

    return fallback_parse(text)