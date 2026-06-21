from app.ai.skill_gap import analyze_gap

def test_basic_gap():
    r = analyze_gap(["Python","React"], ["python","docker","machine learning"])
    assert "docker" in r["missing_skills"]
    assert "python" in r["matched_skills"]
    assert 0 <= r["readiness_percentage"] <= 100

def test_full_match():
    r = analyze_gap(["python","docker"], ["python","docker"])
    assert r["readiness_percentage"] == 100.0
