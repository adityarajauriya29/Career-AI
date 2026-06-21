from app.ai.roadmap_generator import generate_roadmap

def test_fallback_roadmap():
    rm = generate_roadmap("AI Engineer", ["python"], ["docker","nlp"], weekly_hours=10)
    assert rm["target_role"] == "AI Engineer"
    assert len(rm["months"]) >= 5
