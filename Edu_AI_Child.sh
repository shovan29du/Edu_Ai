#!/usr/bin/env bash
# =============================================================
#  Edu_AI_Child — macOS / Linux Launcher
#  Starts the Edu AI children's learning platform
#  Usage:  bash Edu_AI_Child.sh
# =============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Terminal colour codes ────────────────────────────────────
RED='\033[0;31m';   GREEN='\033[0;32m';  YELLOW='\033[1;33m'
BLUE='\033[0;34m';  CYAN='\033[0;36m';   MAGENTA='\033[0;35m'
BOLD='\033[1m';     RESET='\033[0m'

# ── Banner ───────────────────────────────────────────────────
clear
echo ""
echo -e "${CYAN}${BOLD}  ╔══════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}  ║                                                              ║${RESET}"
echo -e "${YELLOW}${BOLD}  ║   ★  Edu_AI_Child  —  Children's Learning Platform  ★       ║${RESET}"
echo -e "${CYAN}${BOLD}  ║                                                              ║${RESET}"
echo -e "${GREEN}  ║   🎓 Grades 1–10  ·  🌍 14 Languages  ·  🎬 345 Films       ║${RESET}"
echo -e "${GREEN}  ║   🏛  Museum  ·  📝 Grammar  ·  🔬 STEM  ·  🎮 Games        ║${RESET}"
echo -e "${CYAN}${BOLD}  ║                                                              ║${RESET}"
echo -e "${CYAN}${BOLD}  ╚══════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# ── Detect OS ────────────────────────────────────────────────
OS="linux"
OPEN_CMD="xdg-open"
if [[ "$(uname)" == "Darwin" ]]; then
    OS="macos"
    OPEN_CMD="open"
fi
echo -e "${MAGENTA}  Platform: ${OS}${RESET}"
echo ""

# ── Prerequisite checks ──────────────────────────────────────
echo -e "${CYAN}  Checking prerequisites...${RESET}"

check_cmd() {
    if ! command -v "$1" &>/dev/null; then
        echo -e "${RED}  [ERROR] '$1' not found.  $2${RESET}"
        exit 1
    fi
    echo -e "${GREEN}  ✓ $1 $(${1} --version 2>&1 | head -1)${RESET}"
}

check_cmd node  "Install from https://nodejs.org/"
check_cmd npm   ""
check_cmd python3 "Install from https://www.python.org/"
echo ""

# ── Frontend build ───────────────────────────────────────────
echo -e "${CYAN}  [1/3] Building frontend...${RESET}"
cd "$ROOT/frontend"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}        Installing npm packages (first run only)...${RESET}"
    npm install
fi

echo -e "${YELLOW}        Compiling React app...${RESET}"
npm run build >/dev/null 2>&1
echo -e "${GREEN}  ✓ Frontend built${RESET}"
echo ""

# ── Python backend ───────────────────────────────────────────
echo -e "${CYAN}  [2/3] Setting up backend...${RESET}"
cd "$ROOT/backend"

if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}        Creating virtual environment...${RESET}"
    python3 -m venv .venv
fi

source .venv/bin/activate
pip install -q -r requirements.txt
echo -e "${GREEN}  ✓ Backend ready${RESET}"
echo ""

# ── Launch ───────────────────────────────────────────────────
echo -e "${CYAN}  [3/3] Launching Edu_AI_Child...${RESET}"
echo ""
echo -e "${YELLOW}${BOLD}  ★  App URL →  http://localhost:8000${RESET}"
echo -e "${YELLOW}  ★  Press Ctrl+C to stop the server${RESET}"
echo ""

# Open browser after 3 s in background
(sleep 3 && $OPEN_CMD "http://localhost:8000" 2>/dev/null) &

# Start FastAPI
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
