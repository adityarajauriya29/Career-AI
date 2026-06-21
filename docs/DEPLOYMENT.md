# Deployment Plan

## 1. MongoDB Atlas
- Create free M0 cluster, whitelist 0.0.0.0/0 (dev) or app server IPs.
- Create DB user; copy connection string to `MONGO_URI`.

## 2. Backend on Render
- New → Web Service → connect GitHub repo (backend/ folder).
- Build: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Env vars: `MONGO_URI`, `MONGO_DB`, `JWT_SECRET`, `GEMINI_API_KEY`, `FRONTEND_ORIGIN`.

## 3. Frontend on Vercel
- Import repo → root `frontend/`.
- Build: `npm run build`, Output: `dist`.
- Env var: `VITE_API_BASE=https://<your-render>.onrender.com/api`.

## 4. Local Dev with Docker
```bash
docker compose up --build
```

## 5. Post-deploy checks
- Hit `/health` on backend.
- Register a test user via frontend.
- Verify resume upload + roadmap generation.
