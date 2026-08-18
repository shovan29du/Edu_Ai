#Requires -Version 5.1
<#
.SYNOPSIS
    Edu_AI_Child — Windows PowerShell Launcher
.DESCRIPTION
    Installs dependencies, builds the React frontend, and launches the
    Edu AI children's learning platform at http://localhost:8000
#>

$ErrorActionPreference = "Stop"

# ── Colour helpers ──────────────────────────────────────────────────────────
function Write-Colour($text, $fg = "White", $bg = "Black") {
    Write-Host $text -ForegroundColor $fg -BackgroundColor $bg
}

function Write-Banner {
    Clear-Host
    Write-Host ""
    Write-Colour "  ╔══════════════════════════════════════════════════════════════╗" "Cyan"
    Write-Colour "  ║                                                              ║" "Cyan"
    Write-Colour "  ║   ★  Edu_AI_Child  —  Children's Learning Platform  ★       ║" "Yellow"
    Write-Colour "  ║                                                              ║" "Cyan"
    Write-Colour "  ║   🎓 Grades 1–10  ·  🌍 14 Languages  ·  🎬 345 Films       ║" "Green"
    Write-Colour "  ║   🏛  Museum  ·  📝 Grammar  ·  🔬 STEM  ·  🎮 Games        ║" "Green"
    Write-Colour "  ║                                                              ║" "Cyan"
    Write-Colour "  ╚══════════════════════════════════════════════════════════════╝" "Cyan"
    Write-Host ""
}

Write-Banner

$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

# ── Check prerequisites ─────────────────────────────────────────────────────
Write-Colour "  Checking prerequisites..." "Magenta"

try { $null = node --version 2>&1 }
catch {
    Write-Colour "  [ERROR] Node.js not found. Install from https://nodejs.org/" "Red"
    Read-Host "Press Enter to exit"
    exit 1
}

try { $null = python --version 2>&1 }
catch {
    Write-Colour "  [ERROR] Python not found. Install from https://www.python.org/" "Red"
    Read-Host "Press Enter to exit"
    exit 1
}

$nodeVer = (node --version).Trim()
$pyVer   = (python --version 2>&1).ToString().Trim()
Write-Colour "  ✓ Node  $nodeVer" "Green"
Write-Colour "  ✓ $pyVer" "Green"
Write-Host ""

# ── Frontend ────────────────────────────────────────────────────────────────
Write-Colour "  [1/3] Building frontend..." "Cyan"
Set-Location "$ROOT\frontend"

if (-not (Test-Path "node_modules")) {
    Write-Colour "        Installing npm packages (first run)..." "Yellow"
    npm install
}
Write-Colour "        Compiling React app..." "Yellow"
npm run build | Out-Null
Write-Colour "  ✓ Frontend built" "Green"
Write-Host ""

# ── Backend ─────────────────────────────────────────────────────────────────
Write-Colour "  [2/3] Setting up Python backend..." "Cyan"
Set-Location "$ROOT\backend"

if (-not (Test-Path ".venv")) {
    Write-Colour "        Creating virtual environment..." "Yellow"
    python -m venv .venv
}

$pip = "$ROOT\backend\.venv\Scripts\pip.exe"
& $pip install -q -r requirements.txt
Write-Colour "  ✓ Backend ready" "Green"
Write-Host ""

# ── Launch ───────────────────────────────────────────────────────────────────
Write-Colour "  [3/3] Launching Edu_AI_Child..." "Cyan"
Write-Host ""
Write-Colour "  ★  URL  →  http://localhost:8000" "Yellow"
Write-Colour "  ★  Press Ctrl+C to stop" "Yellow"
Write-Host ""

# Open browser after 3 s
Start-Job -ScriptBlock {
    Start-Sleep 3
    Start-Process "http://localhost:8000"
} | Out-Null

$uvicorn = "$ROOT\backend\.venv\Scripts\uvicorn.exe"
& $uvicorn app.main:app --host 0.0.0.0 --port 8000
