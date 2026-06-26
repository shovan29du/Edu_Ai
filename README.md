# Edu_Ai — Global Education Platform

Educational software for children, with parental controls and a safety-first content model. Built for two profiles, **Aliza** and **Saifan**, switchable via the header dropdown (no login required).

## Current status

This repo currently contains a **working core skeleton**, not the full 10‑grade, 22‑subject curriculum described in the original spec. That spec is too large to populate honestly in one pass — generating thousands of book/video entries up front would mean mostly fabricated placeholder data. Instead, the skeleton below is real and runnable, and content should be filled in grade-by-grade, subject-by-subject as a deliberate next step.

What's here:

- FastAPI backend with child profiles, progress storage, a safety/profanity filter, and upload scanning.
- React + Vite + Tailwind frontend with child selector, parental control panel (Restricted Mode), grade selector, syllabus cards, video/book sections, and a progress dashboard (Recharts radar chart).
- One real, populated grade (`backend/syllabus/grade1.json`, Math + English) using genuinely free/public resources (Project Gutenberg, CK-12, Khan Academy, BBC Bitesize).
- Backend tests (pytest) and frontend tests (Vitest + Testing Library), all passing.
- Docker Compose for local dev, plus a backend Dockerfile.

What's **not** built yet (left for future iterations): grades 2–10, the other 20 subjects, colouring canvas, karaoke/singing, foreign languages, in-browser code editor, games, exam UI, the `full_install.py` installer, desktop shortcuts, CI/CD workflow, and Vercel/Render deploy configs.

## Running locally

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server proxies `/api/*` to `http://localhost:8000` (see `vite.config.js`).

### Docker Compose

```bash
docker compose up
```

## Tests

```bash
# backend
cd backend && .venv/bin/python -m pytest

# frontend
cd frontend && npm test
```

## Parental Control Panel

Click the 🔒 icon in the header to open the panel. **Restricted Mode** hides any resource that isn't explicitly marked `safe: true` (or has `safe: false`), checked client-side via `frontend/src/utils/safetyFilter.js` and mirrored server-side via `backend/app/safety.py`, which also sanitizes any blocked words found in syllabus text before it reaches the client.

Per-child progress, scores, and badges are stored server-side under `backend/data/progress_<Child>.json` (gitignored — generated at runtime) and fetched through `/api/progress/{child}`.

## Adding new resources

Add entries to the relevant `backend/syllabus/grade<N>.json` file. Every resource (book, video, cartoon, song) must include a `"safe": true` field to be visible in Restricted Mode. Approved video channels are tracked in `backend/safe/safe_channels.json`; only add channels appropriate for children.

## Contributing

Keep additions grade/subject-scoped and verify URLs point to genuinely free, public resources before adding them — don't fabricate links or ratings.
