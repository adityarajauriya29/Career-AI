from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.middleware.auth import get_current_user
from app.core.database import get_db
from app.ai.chatbot import ask
from datetime import datetime

router = APIRouter()

class ChatMessage(BaseModel):
    role: str  # user | model
    content: str

class ChatRequest(BaseModel):
    question: str
    history: Optional[List[ChatMessage]] = []

@router.post("/ask")
async def chat(payload: ChatRequest, user=Depends(get_current_user)):
    answer = ask(payload.question, [m.dict() for m in (payload.history or [])])
    db = get_db()
    await db.chat_history.insert_one({
        "user_id": user["_id"], "question": payload.question,
        "answer": answer, "created_at": datetime.utcnow()
    })
    return {"answer": answer}

@router.get("/history")
async def history(user=Depends(get_current_user)):
    db = get_db()
    items = await db.chat_history.find({"user_id": user["_id"]}).sort("created_at", -1).limit(50).to_list(50)
    for i in items:
        i.pop("_id", None)
        i["created_at"] = i["created_at"].isoformat()
    return items
