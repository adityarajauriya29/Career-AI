# Software Requirements Specification (SRS)
## AI-Powered Career Roadmap & Skill Gap Intelligence Platform

---

## 1. Abstract
This project proposes a web-based AI platform that helps engineering students identify their current skills, compare them with industry-defined career roles, and receive a personalized month-by-month learning roadmap. The system ingests student profiles and PDF resumes, applies NLP-based skill extraction, computes a readiness score, and uses generative AI (Google Gemini) to produce tailored learning paths. Mentors and placement officers receive role-based analytics dashboards. The platform improves placement readiness, reduces the information overload students face when planning their careers, and gives institutions a data-driven view of cohort skill distribution.

## 2. Problem Statement
B.Tech students often lack clarity on (1) what skills they currently possess, (2) what skills their target career requires, (3) what to study next and in what order, and (4) where to find quality learning resources. Existing solutions are generic, manually curated, and do not adapt to the individual's profile. There is no unified platform that combines resume analysis, skill-gap analytics, AI-generated personalized roadmaps, and institutional placement insight.

## 3. Objectives
1. Automate skill extraction from student resumes.
2. Maintain a curated catalog of industry career roles and their required skills.
3. Quantify the gap between current and required skills.
4. Generate personalized, time-boxed learning roadmaps using generative AI.
5. Recommend quality learning resources for each missing skill.
6. Provide progress tracking and analytical dashboards for students, mentors, placement officers, and admins.

## 4. Scope
- **In-Scope:** Authentication (4 roles), profile CRUD, resume PDF parsing, career role catalog, skill gap engine, AI roadmap, resource recommender, AI chatbot, progress tracker, mentor dashboard, placement dashboard, admin dashboard, REST API.
- **Out-of-Scope:** Real-time job recommendation feed, live mock interviews, payment, mobile native app (web is mobile responsive).

## 5. Literature Review (Summary)
Prior systems such as LinkedIn Learning Paths and Coursera Career Academy provide static roadmaps. Academic work in skill-gap mining (Khaouja et al., 2021) focuses on job-ad scraping but lacks personalization. LLM-based career advisors are emerging (e.g., ChatGPT prompts) but lack integration with structured profiles or institutional data. This project bridges the gap by combining structured DB-driven role definitions with LLM-personalized output and role-based institutional dashboards.

## 6. Proposed System
The proposed system uses a 3-tier architecture: React SPA → FastAPI REST API → MongoDB. The AI layer combines deterministic skill matching (set intersection / cosine similarity on TF-IDF) with generative AI (Gemini) for roadmap synthesis. spaCy + curated skill dictionary extracts skills from PDF resumes. JWT + RBAC secures multi-role access.

## 7. Functional Requirements

| ID | Requirement |
|----|------|
| FR-01 | User registration with role selection |
| FR-02 | Email/password login returning JWT |
| FR-03 | Logout (client-side token disposal) |
| FR-04 | Refresh access token via refresh token |
| FR-05 | Change password (authenticated) |
| FR-06 | Forgot/reset password flow |
| FR-07 | Role-based access control (4 roles) |
| FR-08 | Create student profile |
| FR-09 | View student profile |
| FR-10 | Update student profile (skills, year, CGPA, target role, hours) |
| FR-11 | Upload PDF resume |
| FR-12 | Auto-extract skills from resume using NLP |
| FR-13 | Auto-extract certifications and projects from resume |
| FR-14 | List all career roles |
| FR-15 | View role detail with required skills |
| FR-16 | Admin creates/updates career roles |
| FR-17 | Compute skill gap between profile and target role |
| FR-18 | Return matched, missing, extra skills and readiness % |
| FR-19 | Generate AI-driven month-wise roadmap |
| FR-20 | Retrieve saved roadmap |
| FR-21 | Recommend resources for each missing skill |
| FR-22 | Mark skill as completed (progress) |
| FR-23 | Show progress percentage and dashboard charts |
| FR-24 | Mentor views list of students with readiness |
| FR-25 | Mentor views individual student profile + roadmap |
| FR-26 | Mentor posts suggestions to a student |
| FR-27 | Placement officer dashboard: average readiness, top skills, branch breakdown |
| FR-28 | AI chatbot for free-form career queries (Gemini-backed) |
| FR-29 | Chatbot history persisted per user |
| FR-30 | Admin dashboard: user counts, role counts, list users |
| FR-31 | Admin user management |
| FR-32 | Rate limiting on auth and AI endpoints |

## 8. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Scalability | Stateless backend; horizontal scaling behind load balancer. MongoDB sharding supported. |
| Availability | Target 99.5% uptime via managed hosting (Render + Atlas). |
| Reliability | Background indexes on hot fields (email, user_id). Idempotent profile updates. |
| Security | bcrypt password hashing, JWT (HS256) with short access + long refresh, RBAC, input validation via Pydantic, file size + MIME check on uploads, rate limiting via SlowAPI, CORS whitelist. |
| Performance | API p95 < 400ms for non-AI endpoints; AI roadmap < 8s; resume parse < 3s for 2-page PDF. |
| Maintainability | Clean architecture (api/ai/core/schemas separation), typed schemas, pytest unit tests. |
| Usability | Responsive Tailwind UI, sidebar nav, role-aware menu, markdown chatbot rendering. |
| Portability | Dockerized backend; frontend deploys to any static host; MongoDB Atlas portable. |

## 9. Use Case Description
**UC-01 Student plans career:** Student registers → fills profile → uploads resume → views gap for target role → generates roadmap → tracks progress weekly.
**UC-02 Mentor coaches:** Mentor logs in → views student list → opens a student → posts suggestion.
**UC-03 Placement officer audits cohort:** Officer logs in → views aggregate dashboard → exports skill distribution.
**UC-04 Admin manages catalog:** Admin adds/updates career role definitions.
