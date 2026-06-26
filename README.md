# Edu_Ai — Global Education Platform

Educational software for children, with parental controls and a safety-first content model. Built for three profiles, switchable via the header dropdown (no login required): **Aliza** and **Saifan** (children), and **Parent** (resource curation, no learner content).

## Current status

This repo currently contains a **working core skeleton**, not the full 10‑grade, 22‑subject curriculum described in the original spec. That spec is too large to populate honestly in one pass — generating thousands of book/video entries up front would mean mostly fabricated placeholder data. Instead, the skeleton below is real and runnable, and content should be filled in grade-by-grade, subject-by-subject as a deliberate next step.

What's here:

- FastAPI backend with child profiles, progress storage, a safety/profanity filter, upload scanning, a kid-safe resource search endpoint, a live web-search endpoint (parent-only), and a curation endpoint to add reviewed resources into a grade's syllabus.
- React + Vite + Tailwind frontend with child/parent selector, parental control panel (Restricted Mode), grade selector, syllabus cards, video/book sections, a progress dashboard (Recharts radar chart), a cross-subject resource library browser, an in-browser sandboxed code editor, a colouring/drawing canvas, a per-subject exam with auto-grading and retry, and a parent-only curation page.
- Six real, populated grades (`backend/syllabus/grade1.json` through `grade6.json` — Math + English) using genuinely free/public resources (Project Gutenberg, CK-12, Khan Academy, BBC Bitesize, Math Salamanders, ReadWriteThink).
- A `infographics` resource type alongside books/videos/text/cartoons, rendered as an image grid (`InfographicGrid`), and selectable when a Parent curates new content.
- A "Read aloud" button (browser `SpeechSynthesis` API, no external service) on books and videos, so younger children can have titles/descriptions read out loud.
- A "Favourites" feature: children can star any book, video, or infographic and revisit it from a dedicated Favourites tab. Stored per-child in `localStorage` (`favorites_<Child>`) — no backend persistence needed since it's a personal, non-graded bookmark list.
- Backend tests (pytest, 21 passing) and frontend tests (Vitest + Testing Library, 27 passing).
- Docker Compose for local dev, plus a backend Dockerfile.

What's **not** built yet (left for future iterations): grades 7–10, the other 20 subjects, karaoke/singing, foreign languages, games, the `full_install.py` installer, desktop shortcuts, CI/CD workflow, and Vercel/Render deploy configs.

### A note on infographics and Pinterest

Pinterest pins are individual, user-posted content — URLs are not stable, and there's no reliable way to verify *in this environment* that a given pin is still live, kid-appropriate, and not just a screenshot of someone else's copyrighted graphic. Rather than fabricate Pinterest pin links, the pre-seeded `infographics` entries point to stable, official sources (Math Salamanders, ReadWriteThink) that are confirmed safe to link to long-term. If you want to pull in a specific Pinterest infographic (or any other one-off image resource), use the **Parent** account's Curate flow: search the web, review the result yourself, then add it — the same human-review step that gates every other resource in this app.

### Search and resource browsing (kid-facing, safe by construction)

- **Search tab**: a search box for children, but it never queries the open web. It calls `GET /api/search/{standard}?q=`, which only searches resources already present in that grade's `syllabus/grade<N>.json` and filters out anything not marked `safe: true`.
- **Library tab**: browses all books/videos/text resources/cartoons across every subject for the selected grade in one place, respecting Restricted Mode.

### Parent account: live web search + curation (parent-only)

Selecting **Parent** in the profile dropdown switches the app into a curation mode with its own tabs (`Library`, `Search`, `Curate`) — no exam, progress dashboard, or code editor, since those are learner features.

The **Curate** tab is the only place in the app that touches the open internet:

1. Parent types a search query and picks a grade/subject/resource type.
2. The frontend calls `GET /api/web-search?q=`, which performs a **live** web search via the [Brave Search API](https://brave.com/search/api/) (`backend/app/websearch.py`).
3. Raw results (title, URL, description) are shown for the parent to review — they are *not* shown to children and are *not* auto-saved.
4. Clicking "Add to syllabus" on a reviewed result calls `POST /api/curate-resource`, which runs the result through `backend/app/safety.py`'s blocked-word filter, force-sets `safe: true`, and appends it into the relevant grade's `syllabus/grade<N>.json` (creating the subject/file if it doesn't exist yet). Only after this step does the resource become visible to children.

**Setup required**: live web search needs a Brave Search API key (free tier available). Set it on the backend before running:

```bash
export BRAVE_SEARCH_API_KEY=your-key-here
```

Without this variable, `/api/web-search` returns `501` with an explanatory message — the rest of the app works fine, but the Curate tab's search will show that error until a key is configured. No key is bundled with this repo.

## Running locally

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export BRAVE_SEARCH_API_KEY=your-key-here  # optional, enables Parent web search
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

This is independent of the **Parent profile** described above — the lock-icon panel controls what's visible to whichever child profile is currently selected; the Parent profile is a separate account used only for finding and approving new content.

Per-child progress, scores, and badges are stored server-side under `backend/data/progress_<Child>.json` (gitignored — generated at runtime) and fetched through `/api/progress/{child}`. The Parent profile has no progress file — it isn't a learner.

## Adding new resources

Two ways to add resources:

1. **Manually**: edit the relevant `backend/syllabus/grade<N>.json` file directly. Every resource (book, video, cartoon, text) must include a `"safe": true` field to be visible in Restricted Mode.
2. **Via the Parent curation flow**: switch to the Parent profile, search the live web, review results, and click "Add to syllabus" — this writes the resource into the right grade's JSON file automatically with `safe: true` already set, after passing the profanity/safety filter.

Approved video channels are tracked in `backend/safe/safe_channels.json`; only add channels appropriate for children.

## Contributing

Keep additions grade/subject-scoped and verify URLs point to genuinely free, public resources before adding them — don't fabricate links or ratings.
