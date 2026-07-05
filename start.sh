#!/usr/bin/env bash
# Starts backend (port 8000) and frontend (port 5173) together.
# Run from the project root: bash start.sh
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── Backend ──────────────────────────────────────────────────────────────────
cd "$ROOT/backend"
if [ ! -d ".venv" ]; then
  echo "Creating backend virtualenv..."
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt
echo "Starting backend on http://localhost:8000 ..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# ── Frontend ─────────────────────────────────────────────────────────────────
cd "$ROOT/frontend"
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi
echo "Starting frontend on http://localhost:5173 ..."
npm run dev

# If the frontend exits, kill the backend too
kill $BACKEND_PID 2>/dev/null || true
