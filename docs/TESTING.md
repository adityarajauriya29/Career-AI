# Testing Plan & Test Cases

## Levels
1. **Unit Testing** — pytest, focused on `app/ai/` pure functions and util layers.
2. **Integration Testing** — TestClient (FastAPI) exercising router→DB→service path with a test MongoDB.
3. **System Testing** — End-to-end browser walkthrough of all 11 modules per role.
4. **Security Testing** — JWT tamper, role escalation, SQL/NoSQL injection in form fields, file-type spoofing.
5. **Performance Testing** — Locust/k6 baseline: 100 concurrent users, p95 < 400ms (non-AI).

## Test Cases

| # | Module | Case | Expected |
|---|--------|------|----------|
| TC-01 | Auth | Register with valid data | 200 + tokens |
| TC-02 | Auth | Register duplicate email | 400 |
| TC-03 | Auth | Login wrong password | 401 |
| TC-04 | Auth | Access protected without token | 401 |
| TC-05 | Auth | Refresh with bad token | 401 |
| TC-06 | Profile | Update profile as student | 200 + persisted |
| TC-07 | Profile | Update profile as unauthenticated | 401 |
| TC-08 | Roles | List roles seeds defaults first time | 200 + non-empty |
| TC-09 | Roles | Create role as student | 403 |
| TC-10 | Gap | Analyze with valid role | readiness ∈ [0,100] |
| TC-11 | Gap | Analyze with unknown role | 404 |
| TC-12 | Roadmap | Generate w/o Gemini key falls back | months ≥ 5 |
| TC-13 | Roadmap | Generate w/ Gemini key returns JSON months | months parsed |
| TC-14 | Resume | Upload non-PDF | 400 |
| TC-15 | Resume | Upload >5MB | 400 |
| TC-16 | Resume | Upload valid PDF | skills list populated |
| TC-17 | Progress | Mark skill complete | persisted |
| TC-18 | Mentor | Student calls /mentor/students | 403 |
| TC-19 | Mentor | Mentor lists students | array |
| TC-20 | Placement | Officer overview | distribution dict |
| TC-21 | Chatbot | Ask question (no key) | helpful fallback string |
| TC-22 | Admin | Student calls /admin/stats | 403 |
| TC-23 | Security | Tampered JWT | 401 |
| TC-24 | Security | Rate limit on login (>5/min) | 429 |
| TC-25 | Unit | analyze_gap full match | 100% |

Run unit tests:
```bash
cd backend && pytest -v
```
