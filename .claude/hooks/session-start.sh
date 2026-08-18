#!/bin/bash
set -euo pipefail

# Only run in remote Claude Code on the web sessions
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo '{"async": true, "asyncTimeout": 300000}'

PROJECT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

# ── Frontend: install deps (cached after first run) ────────────────────────
cd "$PROJECT/frontend"
if [ ! -d node_modules ]; then
  npm install
fi

# ── Backend: create venv + install deps ────────────────────────────────────
cd "$PROJECT/backend"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
source .venv/bin/activate
pip install -q -r requirements.txt

# ── Start FastAPI in background (serves both API and React build) ──────────
pkill -f "uvicorn app.main:app" 2>/dev/null || true
sleep 1
nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 \
  > /tmp/uvicorn.log 2>&1 &
echo "Backend started (pid $!)"
