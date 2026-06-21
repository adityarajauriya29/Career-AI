"""AI career advisor chatbot using Groq."""

from app.core.config import settings

try:
    from groq import Groq

    if settings.GROQ_API_KEY:
        _CLIENT = Groq(api_key=settings.GROQ_API_KEY)
    else:
        _CLIENT = None
except Exception:
    _CLIENT = None


SYSTEM = """You are a friendly career advisor for B.Tech CSE students.
Give concise, practical advice on careers in software, AI, data, and tech.
Recommend specific courses, projects, and skill-building steps when asked."""


def ask(question: str, history: list = None) -> str:
    if not _CLIENT:
        return (
            "AI chatbot is not configured. Add GROQ_API_KEY in backend/.env. "
            f"Meanwhile, for your question: '{question}' — explore official docs, "
            "build small projects, and target the missing skills from your gap analysis."
        )

    history = history or []

    messages = [
        {
            "role": "system",
            "content": SYSTEM
        }
    ]

    for m in history[-10:]:
        role = m.get("role", "user")
        content = m.get("content", "")

        if role not in ["user", "assistant"]:
            role = "user"

        messages.append({
            "role": role,
            "content": content
        })

    messages.append({
        "role": "user",
        "content": question
    })

    try:
        response = _CLIENT.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=messages,
            temperature=0.5,
            max_tokens=700
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"AI error using Groq: {e}"