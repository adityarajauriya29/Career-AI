"""Student profile schemas."""
from pydantic import BaseModel, Field
from typing import List, Optional

class GapInfo(BaseModel):
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    extra_skills: List[str] = []
    readiness_percentage: float = 0
    total_required: int = 0
    total_matched: int = 0
    target_role: Optional[str] = None

class ProfileBase(BaseModel):
    branch: Optional[str] = None
    year: Optional[int] = Field(None, ge=1, le=5)
    cgpa: Optional[float] = Field(None, ge=0, le=10)
    skills: List[str] = []
    certifications: List[str] = []
    projects: List[dict] = []
    interests: List[str] = []
    target_role: Optional[str] = None
    weekly_study_hours: Optional[int] = Field(None, ge=0, le=100)

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    user_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    latest_gap: Optional[GapInfo] = None