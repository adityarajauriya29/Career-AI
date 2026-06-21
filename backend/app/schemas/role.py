from pydantic import BaseModel
from typing import List, Optional

class CareerRole(BaseModel):
    name: str
    description: str
    required_skills: List[str]
    difficulty: str  # Beginner | Intermediate | Advanced
    duration_months: int
    recommended_projects: List[str] = []
