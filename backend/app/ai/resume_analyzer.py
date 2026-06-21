import json
from pypdf import PdfReader
import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")


def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    return text.strip()


def clean_json(text: str) -> str:
    text = text.strip()
    text = text.replace("```json", "")
    text = text.replace("```", "")
    return text.strip()


def analyze_resume_text(resume_text: str):
    prompt = f"""
You are an AI resume analyzer.

Analyze this resume text and extract structured information.

Resume Text:
{resume_text}

Return ONLY valid JSON in this format:

{{
  "skills": [],
  "technologies": [],
  "projects": [
    {{
      "title": "",
      "description": "",
      "technologies": []
    }}
  ],
  "certifications": [],
  "experience": [],
  "education": [],
  "summary": ""
}}

Rules:
- Extract only information present in resume.
- Do not invent fake data.
- Skills must be lowercase.
- Keep project descriptions short.
- Return JSON only.
"""

    response = model.generate_content(prompt)
    text = clean_json(response.text)

    return json.loads(text)