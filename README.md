# AI-Powered Career Roadmap & Skill Gap Intelligence Platform

**B.Tech CSE Major Project** — Personalized career roadmaps powered by AI.

## Stack
- **Frontend:** React 18, Tailwind CSS, React Router, Axios, Recharts
- **Backend:** FastAPI (Python 3.11), Motor (async MongoDB), Pydantic v2, JWT (python-jose), bcrypt
- **Database:** MongoDB Atlas / local MongoDB
- **AI:** spaCy + PyPDF for resume parsing, Google Gemini for roadmap generation & chatbot, scikit-learn for similarity
- **Deployment:** Vercel (frontend) + Render (backend) + MongoDB Atlas

## Quick Start

### 1. Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
cp .env.example .env   # then edit MONGO_URI, JWT_SECRET, GEMINI_API_KEY
uvicorn app.main:app --reload
```
Open API docs at http://localhost:8000/docs

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
Open http://localhost:5173

### 3. First steps
1. Register as a **Student** → set Profile (skills, target role, weekly hours)
2. Visit **Skill Gap** → analyze for your target role
3. Visit **Roadmap** → generate AI-powered month-wise plan
4. Upload PDF resume to auto-extract skills

## Roles
- `student` — profile, gap, roadmap, resume, chatbot
- `mentor` — view students, suggest improvements
- `placement_officer` — readiness analytics, skill distribution
- `admin` — full system stats, user management

## Project Structure
```
backend/
  app/
    api/          # FastAPI routers (11 modules)
    ai/           # spaCy resume parser, Gemini roadmap, skill gap engine, recommender, chatbot
    core/         # config, DB, security (JWT, bcrypt)
    middleware/   # auth dep + RBAC
    schemas/      # Pydantic models
  tests/          # pytest
frontend/
  src/
    pages/        # 11 page components (one per module)
    components/   # Layout, Protected route
    context/      # AuthContext
    services/     # axios instance with interceptors
docs/             # SRS, architecture, API spec, viva Q&A, test plan, PPT outline
```

## Docs (see `docs/`)
- `SRS.md` — Abstract, problem, objectives, FR/NFR, use cases
- `ARCHITECTURE.md` — High-level + component + DFD + sequence
- `DATABASE.md` — MongoDB collections, fields, indexes
- `API.md` — REST API reference
- `TESTING.md` — 20+ test cases
- `DEPLOYMENT.md` — Vercel + Render + Atlas
- `VIVA.md` — 40+ viva questions & answers
- `REPORT_STRUCTURE.md` — Chapter-wise final report outline
- `PPT_OUTLINE.md` — 15-slide presentation outline
