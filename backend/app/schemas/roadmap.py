from pydantic import BaseModel
from typing import List, Optional


class RoadmapRequest(BaseModel):
    target_role: str
    weekly_hours: int = 10
    level: Optional[str] = None

    # NEW
    roadmap_type: str = "month"   # month | week


class RoadmapStep(BaseModel):
    title: str

    focus: str

    topics: List[str] = []

    tasks: List[str] = []

    resources: List[str] = []

    project: Optional[str] = None

    outcome: Optional[str] = None


class RoadmapOut(BaseModel):
    user_id: str

    target_role: str

    level: str

    roadmap_type: str

    weekly_hours: int

    roadmap: List[RoadmapStep]