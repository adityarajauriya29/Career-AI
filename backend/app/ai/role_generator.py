import json
import google.generativeai as genai
from app.core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.0-flash")

async def generate_roles_from_target(target_role: str):
    prompt = f"""
    You are an AI career advisor.

    Based on the selected target role: "{target_role}",
    generate valid and realistic career roles related to it.

    Return ONLY valid JSON in this format:

    {{
      "target_role": "{target_role}",
      "recommended_roles": [
        {{
          "role_name": "",
          "description": "",
          "required_skills": [],
          "difficulty": "Beginner/Intermediate/Advanced",
          "average_learning_time": "",
          "career_path": []
        }}
      ]
    }}

    Rules:
    - Generate 6 to 10 valid roles.
    - Roles must be realistic and industry-relevant.
    - Do not include fake job titles.
    - Keep descriptions short.
    """

    response = model.generate_content(prompt)

    text = response.text.strip()
    text = text.replace("```json", "").replace("```", "").strip()

    return json.loads(text)