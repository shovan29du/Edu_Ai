#!/usr/bin/env bash
# Builds the React frontend and serves everything from the FastAPI backend.
# Run from the project root: bash start.sh
# App is available at http://localhost:8000
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Frontend build ────────────────────────────────────────────────────────────
cd "$ROOT/frontend"
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi
echo "Building frontend..."
npm run build

# ── Backend (also serves the frontend dist/) ──────────────────────────────────
cd "$ROOT/backend"
if [ ! -d ".venv" ]; then
  echo "Creating backend virtualenv..."
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt
echo "Starting app on http://localhost:8000 ..."
uvicorn app.main:app --host 0.0.0.0 --port 8000
