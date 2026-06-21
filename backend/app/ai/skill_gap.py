"""Skill gap analysis engine."""
from typing import List, Dict

def analyze_gap(student_skills: List[str], required_skills: List[str]) -> Dict:
    s = {x.lower().strip() for x in student_skills}
    r = {x.lower().strip() for x in required_skills}
    matched = sorted(s & r)
    missing = sorted(r - s)
    extra = sorted(s - r)
    readiness = round(100 * len(matched) / max(len(r), 1), 2)
    return {
        "matched_skills": matched,
        "missing_skills": missing,
        "extra_skills": extra,
        "readiness_percentage": readiness,
        "total_required": len(r),
        "total_matched": len(matched),
    }
