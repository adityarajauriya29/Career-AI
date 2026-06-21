# System Architecture

## 1. High-Level Architecture (3-tier)

```
+-------------------+        HTTPS/JWT        +--------------------+
|   React SPA       |  <-------------------> |   FastAPI Backend  |
|   (Vercel)        |        REST/JSON       |    (Render)        |
+-------------------+                        +---------+----------+
                                                       |
                                          +------------+------------+
                                          |                         |
                                  +-------v--------+       +--------v---------+
                                  | MongoDB Atlas  |       |   AI Layer       |
                                  | (collections)  |       | spaCy, scikit,   |
                                  +----------------+       | Gemini API       |
                                                           +------------------+
```

## 2. Component Diagram
- **Auth Module:** /api/auth — register, login, refresh, password
- **Profile Module:** /api/profile
- **Career Role Module:** /api/roles
- **Skill Gap Engine:** /api/gap → uses `ai/skill_gap.py`
- **Roadmap Generator:** /api/roadmap → uses `ai/roadmap_generator.py` (Gemini + fallback)
- **Resume Parser:** /api/resume → uses `ai/resume_parser.py` (PyPDF + spaCy)
- **Recommender:** `ai/recommender.py` — keyword → curated resources
- **Progress Tracker:** /api/progress
- **Mentor Module:** /api/mentor — RBAC: mentor/admin
- **Placement Module:** /api/placement — RBAC: placement_officer/admin
- **Chatbot:** /api/chatbot — Gemini-backed
- **Admin:** /api/admin — RBAC: admin

## 3. Data Flow Diagram (Roadmap Generation)
```
[Student UI]
   |  POST /roadmap/generate {target_role, weekly_hours}
   v
[FastAPI Router]
   |
   v
[Auth Middleware]  -- verify JWT
   |
   v
[Roadmap Service]
   |--> Mongo: fetch profile.skills
   |--> Mongo: fetch role.required_skills
   |--> skill_gap.analyze_gap()
   |--> roadmap_generator.generate_roadmap()
   |        |--> Gemini API (if key) else rule-based fallback
   |--> recommender.recommend(missing_skills)
   |--> Mongo: upsert roadmap
   v
[JSON Response]
```

## 4. Sequence Diagram — Resume Upload
```
Student -> Frontend: select PDF, click Upload
Frontend -> Backend: POST /resume/upload (multipart)
Backend -> Auth: verify JWT
Backend -> Parser: parse_resume(bytes)
Parser -> PyPDF: extract text
Parser -> spaCy/keyword DB: detect skills
Backend -> Mongo: merge skills into profile
Backend -> Frontend: {skills, certifications, projects}
Frontend -> Student: render results
```

## 5. Deployment Diagram
```
[User Browser] -- HTTPS --> [Vercel (React)] -- /api --> [Render (FastAPI)] -- TCP --> [MongoDB Atlas]
                                                              |
                                                              +--> [Google Gemini API]
```
