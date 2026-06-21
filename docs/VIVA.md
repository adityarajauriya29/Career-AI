# Viva Voce — 40 Questions & Answers

### 1. What problem does your project solve?
Students lack a personalized, data-driven plan to bridge their skills with industry-required skills for their target role. We automate skill discovery, gap analysis, and roadmap generation.

### 2. Why MongoDB over SQL?
Student profiles, skills, certifications, and roadmaps are semi-structured and evolve frequently. MongoDB's document model fits naturally and avoids schema migrations as the catalog grows.

### 3. Why FastAPI over Django/Flask?
FastAPI gives native async I/O (great with Motor + external AI calls), auto-generated OpenAPI docs, and Pydantic validation for free.

### 4. How is authentication implemented?
JWT (HS256) issued on login; access token (60 min) + refresh token (7 days). bcrypt for password hashing. FastAPI dependency `get_current_user` decodes and loads the user; `require_role` enforces RBAC.

### 5. How do you prevent privilege escalation?
Role is signed inside the JWT and re-validated server-side against the database on every protected request via `require_role` dependencies.

### 6. How does the skill gap engine work?
Set-based comparison after case-normalization. Returns matched (∩), missing (required − student), extra (student − required), and readiness = |matched| / |required| × 100.

### 7. Why not cosine similarity?
For required-skill checklist this is overkill. Cosine on TF-IDF is used as an optional similarity score for fuzzy skill matching (planned extension).

### 8. How does roadmap generation work?
Combine missing skills + weekly hours + year of study → prompt Gemini-1.5-flash to return JSON months. If the key is absent or the call fails, fall back to a curated rule-based template per role.

### 9. Why Gemini over OpenAI?
Generous free tier on AI Studio; equivalent quality for structured generation. API is swappable.

### 10. How is the resume parsed?
PyPDF extracts raw text. We run a regex-keyword pass over a curated skills dictionary (~80 tech terms) and pattern-match lines containing certification/project markers. spaCy is loaded for future NER expansion.

### 11. How accurate is the resume parser?
On a small test set, ~85% recall on common stack keywords. Misses skills not in the dictionary — the dictionary is easily extensible.

### 12. How is the chatbot context preserved?
Frontend sends last 10 messages with each `/chatbot/ask` call. Server attaches them to the Gemini multi-turn conversation. Persisted per user in `chat_history`.

### 13. Explain RBAC enforcement.
Dependency `require_role("mentor","admin")` raises 403 if `current_user.role` is not in the allowed set. Frontend hides nav items by role for UX, but server is the source of truth.

### 14. How do you secure file uploads?
Whitelist `.pdf` extension, max 5MB, parse with PyPDF (which rejects non-PDF binary). No write to disk — bytes processed in memory.

### 15. How do you rate-limit?
SlowAPI middleware tied to remote address. Applied to /auth and /chatbot endpoints.

### 16. CORS — why and how?
React (port 5173) and FastAPI (8000) are different origins. We whitelist `FRONTEND_ORIGIN` only.

### 17. How is the readiness percentage shown?
PieChart (Recharts) on the dashboard splits Ready vs Gap. Center label overlays the % value.

### 18. What if Gemini is down?
Roadmap and chatbot have graceful fallbacks (rule-based path / informative message) so the app stays functional.

### 19. How do you test the AI layer?
Unit tests on pure functions (`analyze_gap`, `_fallback_roadmap`). Integration tests stub the Gemini call.

### 20. What database indexes do you use?
`users.email` unique, `profiles.user_id` unique, `career_roles.name` unique, `roadmaps.user_id`, compound `progress(user_id, skill)`.

### 21. How does the mentor see students?
`/mentor/students` joins users (role=student) with profiles in code (Motor) and returns name, branch, target role, readiness.

### 22. Why not WebSockets for chatbot?
Single request/response works; streaming is a future enhancement using FastAPI's `StreamingResponse` and Gemini stream API.

### 23. How is state managed in React?
Auth state in React Context; per-page data in local component state via `useEffect` + axios. No Redux needed at this scale.

### 24. Why React Router v6?
Nested routes (Layout with `<Outlet/>`), `<Navigate>` for redirects, modern data API.

### 25. How is the project tested manually?
End-to-end script: register 4 roles → profile → resume upload → gap → roadmap → mentor login → placement login → admin.

### 26. Scalability bottleneck?
Gemini API rate limits and synchronous roadmap generation. Mitigation: queue (Celery/Redis), cache roadmaps per (user, role, hours) tuple.

### 27. How would you add OAuth?
Add Google OAuth via Authlib in FastAPI; map Google profile → user. Already-issued JWT remains the session token.

### 28. Why bcrypt and not SHA-256?
Bcrypt is adaptive (cost factor), slow on purpose to resist brute-force; SHA-256 is too fast and unsuitable for passwords.

### 29. How do you protect against NoSQL injection?
Pydantic schemas coerce types; Motor uses parameterized BSON, not string interpolation. No `$where` JS evaluation.

### 30. What about XSS in chatbot markdown?
`react-markdown` sanitizes by default (no `dangerouslySetInnerHTML`).

### 31. How are environment secrets handled?
`.env` (not committed), loaded by Pydantic `BaseSettings`. In prod, set via Render/Vercel env vars.

### 32. Time complexity of gap analysis?
O(|S| + |R|) using Python sets.

### 33. How is the roadmap stored?
Upserted in `roadmaps` collection, one per user (overwrites prior).

### 34. Why upsert?
Idempotent; regenerating doesn't create duplicates.

### 35. How does the placement officer dashboard aggregate?
Loads students + profiles, aggregates in Python (Counter). For very large data, switch to MongoDB aggregation pipeline.

### 36. Difference between TF-IDF and embeddings?
TF-IDF is sparse term frequency; embeddings (e.g., sentence-transformers) capture semantics. Future work uses embeddings to match similar skills (e.g., "PyTorch" ≈ "Torch").

### 37. How would you add an LMS-style course tracker?
Extend `progress` collection with course_id, percent_complete; integrate with Coursera/Udemy APIs.

### 38. How is the project deployable?
Dockerfile for backend; Vercel for static frontend; MongoDB Atlas. CI: GitHub Actions running pytest + npm build on PRs.

### 39. Future scope?
Embeddings-based skill matching, job recommendation feed, gamified XP, mock interview bot, mobile app via React Native, multi-tenant for multiple colleges.

### 40. Why is this an industry-grade project?
Clean separation of concerns, RBAC, JWT auth, rate limiting, schema validation, async I/O, AI fallback, indexed DB, tests, Dockerized, deployable on free tiers, documented OpenAPI.
