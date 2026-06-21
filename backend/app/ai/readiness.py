def calculate_readiness(
    profile,
    roadmap_progress=0,
    resume_score=0
):
    projects = profile.get("projects", [])
    certifications = profile.get("certifications", [])
    latest_gap = profile.get("latest_gap", {}) or {}

    skill_match = latest_gap.get("readiness_percentage", 0)

    project_score = min(len(projects) * 20, 100)
    certification_score = min(len(certifications) * 25, 100)

    final_score = round(
        (
            skill_match * 0.40 +
            project_score * 0.20 +
            certification_score * 0.15 +
            roadmap_progress * 0.15 +
            resume_score * 0.10
        ),
        2
    )

    return {
        "overall_readiness": final_score,
        "skill_match": skill_match,
        "project_strength": project_score,
        "certification_strength": certification_score,
        "roadmap_progress": roadmap_progress,
        "resume_score": resume_score
    }


def calculate_resume_score(parsed_resume, target_role=None, required_skills=None):
    skills = parsed_resume.get("skills", []) or []
    technologies = parsed_resume.get("technologies", []) or []
    projects = parsed_resume.get("projects", []) or []
    certifications = parsed_resume.get("certifications", []) or []
    education = parsed_resume.get("education", []) or []
    summary = parsed_resume.get("summary", "")
    raw_text_length = parsed_resume.get("raw_text_length", 0)

    all_skills = sorted(set(skills + technologies))

    skills_score = min(len(all_skills) * 3, 30)
    projects_score = min(len(projects) * 10, 30)
    certifications_score = min(len(certifications) * 5, 15)

    role_match_score = 0
    matched_role_skills = []
    missing_role_skills = []

    if required_skills:
        normalized_resume_skills = {
            str(s).lower().strip()
            for s in all_skills
            if str(s).strip()
        }

        normalized_required = {
            str(s).lower().strip()
            for s in required_skills
            if str(s).strip()
        }

        matched_role_skills = sorted(normalized_resume_skills & normalized_required)
        missing_role_skills = sorted(normalized_required - normalized_resume_skills)

        if normalized_required:
            role_match_score = round(
                (len(matched_role_skills) / len(normalized_required)) * 15,
                2
            )

    completeness_score = 0

    if summary:
        completeness_score += 2
    if all_skills:
        completeness_score += 2
    if projects:
        completeness_score += 2
    if education:
        completeness_score += 2
    if certifications:
        completeness_score += 2

    total_score = round(
        skills_score +
        projects_score +
        certifications_score +
        role_match_score +
        completeness_score,
        2
    )

    ats_score = calculate_ats_score(
        parsed_resume=parsed_resume,
        target_role=target_role,
        required_skills=required_skills,
        matched_role_skills=matched_role_skills
    )

    strengths = []
    weaknesses = []
    suggestions = []

    if skills_score >= 20:
        strengths.append("Good technical skill coverage")
    else:
        weaknesses.append("Limited technical skills detected")
        suggestions.append("Add more role-relevant technical skills")

    if projects_score >= 20:
        strengths.append("Strong project portfolio")
    else:
        weaknesses.append("Project portfolio needs improvement")
        suggestions.append("Add at least 2 to 3 strong real-world projects")

    if certifications_score > 0:
        strengths.append("Certifications are present")
    else:
        weaknesses.append("No certifications detected")
        suggestions.append("Complete at least one relevant certification")

    if required_skills:
        if role_match_score >= 10:
            strengths.append("Resume skills match the selected target role")
        else:
            weaknesses.append("Resume has low match with target role requirements")
            suggestions.append("Add missing target-role skills to your resume")

    if completeness_score < 8:
        weaknesses.append("Resume sections are incomplete")
        suggestions.append("Include summary, skills, education, projects, and certifications")

    if ats_score["score"] < 70:
        weaknesses.append("ATS compatibility can be improved")
        suggestions.extend(ats_score["suggestions"])

    return {
        "score": min(total_score, 100),
        "ats_score": ats_score,
        "target_role": target_role,
        "raw_text_length": raw_text_length,
        "breakdown": {
            "skills_score": skills_score,
            "projects_score": projects_score,
            "certifications_score": certifications_score,
            "role_match_score": role_match_score,
            "completeness_score": completeness_score
        },
        "matched_role_skills": matched_role_skills,
        "missing_role_skills": missing_role_skills,
        "strengths": strengths,
        "weaknesses": list(dict.fromkeys(weaknesses)),
        "suggestions": list(dict.fromkeys(suggestions))
    }


def calculate_ats_score(
    parsed_resume,
    target_role=None,
    required_skills=None,
    matched_role_skills=None
):
    skills = parsed_resume.get("skills", []) or []
    technologies = parsed_resume.get("technologies", []) or []
    projects = parsed_resume.get("projects", []) or []
    certifications = parsed_resume.get("certifications", []) or []
    education = parsed_resume.get("education", []) or []
    summary = parsed_resume.get("summary", "")
    raw_text_length = parsed_resume.get("raw_text_length", 0)

    all_skills = sorted(set(skills + technologies))
    required_skills = required_skills or []
    matched_role_skills = matched_role_skills or []

    readability_score = 20 if raw_text_length >= 500 else 10 if raw_text_length > 0 else 0

    keyword_score = 0
    if required_skills:
        keyword_score = round(
            (len(matched_role_skills) / len(required_skills)) * 30,
            2
        )
    elif all_skills:
        keyword_score = min(len(all_skills) * 2, 30)

    section_score = 0
    if summary:
        section_score += 5
    if all_skills:
        section_score += 5
    if projects:
        section_score += 5
    if education:
        section_score += 5

    project_score = min(len(projects) * 7.5, 15)
    certification_score = min(len(certifications) * 5, 15)

    total = round(
        readability_score +
        keyword_score +
        section_score +
        project_score +
        certification_score,
        2
    )

    suggestions = []

    if readability_score < 20:
        suggestions.append("Use a text-based PDF resume instead of image/scanned PDF")

    if keyword_score < 20:
        suggestions.append("Add more target-role keywords and required skills")

    if section_score < 20:
        suggestions.append("Add missing resume sections like summary, skills, education, and projects")

    if project_score < 10:
        suggestions.append("Add more project descriptions with technologies used")

    if certification_score < 5:
        suggestions.append("Add relevant certifications if available")

    if total >= 80:
        status = "Excellent"
    elif total >= 65:
        status = "Good"
    elif total >= 45:
        status = "Average"
    else:
        status = "Needs Improvement"

    return {
        "score": min(total, 100),
        "status": status,
        "breakdown": {
            "readability_score": readability_score,
            "keyword_score": keyword_score,
            "section_score": section_score,
            "project_score": project_score,
            "certification_score": certification_score
        },
        "suggestions": suggestions
    }