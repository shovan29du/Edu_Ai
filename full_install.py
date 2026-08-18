#!/usr/bin/env python3
"""Installs Edu_Ai's backend and frontend dependencies, and creates a desktop
shortcut that launches the app.

Usage:
    python3 full_install.py

Run from anywhere - the script locates the repo root from its own path.
"""
import os
import platform
import shutil
import stat
import subprocess
import sys
import venv
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent
BACKEND_DIR = REPO_ROOT / "backend"
FRONTEND_DIR = REPO_ROOT / "frontend"
VENV_DIR = BACKEND_DIR / ".venv"
IS_WINDOWS = platform.system() == "Windows"
IS_MAC = platform.system() == "Darwin"
IS_LINUX = platform.system() == "Linux"
MIN_PYTHON = (3, 9)


def check_python_version():
    if sys.version_info < MIN_PYTHON:
        print(
            f"Edu_Ai requires Python {MIN_PYTHON[0]}.{MIN_PYTHON[1]}+ - "
            f"found {platform.python_version()}. Install a newer Python and re-run this script."
        )
        sys.exit(1)


def ensure_node():
    """Installs Node.js via the OS package manager if npm isn't already on PATH."""
    if shutil.which("npm"):
        return
    print("\n== Node.js not found - attempting to install it ==")
    if IS_MAC and shutil.which("brew"):
        run(["brew", "install", "node"])
    elif IS_LINUX and shutil.which("apt-get"):
        run(["sudo", "apt-get", "update"])
        run(["sudo", "apt-get", "install", "-y", "nodejs", "npm"])
    elif IS_WINDOWS and shutil.which("winget"):
        run(["winget", "install", "-e", "--id", "OpenJS.NodeJS.LTS"])
    else:
        print(
            "Could not auto-install Node.js on this system. "
            "Install it manually from https://nodejs.org and re-run this script."
        )
        sys.exit(1)

    if not shutil.which("npm"):
        print("Node.js install finished but npm is still not on PATH - open a new terminal and re-run this script.")
        sys.exit(1)


def venv_python() -> Path:
    return VENV_DIR / ("Scripts/python.exe" if IS_WINDOWS else "bin/python")


def run(cmd, cwd=None):
    print(f"$ {' '.join(str(c) for c in cmd)}")
    subprocess.run(cmd, cwd=cwd, check=True)


def install_backend():
    print("\n== Installing backend ==")
    if not venv_python().exists():
        venv.EnvBuilder(with_pip=True).create(VENV_DIR)
    run([str(venv_python()), "-m", "pip", "install", "--upgrade", "pip"])
    run([str(venv_python()), "-m", "pip", "install", "-r", str(BACKEND_DIR / "requirements.txt")])


def install_frontend():
    print("\n== Installing frontend ==")
    ensure_node()
    run([shutil.which("npm"), "install"], cwd=FRONTEND_DIR)


def write_launcher() -> Path:
    """Writes a script that starts the backend and frontend dev servers and
    opens the app in a browser, returning its path."""
    if IS_WINDOWS:
        launcher = REPO_ROOT / "start_edu_ai.bat"
        py = venv_python()
        npm = shutil.which("npm") or "npm"
        launcher.write_text(
            "@echo off\r\n"
            f'cd "{BACKEND_DIR}"\r\n'
            f'start "Edu_Ai backend" "{py}" -m uvicorn app.main:app --port 8000\r\n'
            f'cd "{FRONTEND_DIR}"\r\n'
            f'start "Edu_Ai frontend" "{npm}" run dev\r\n'
            "timeout /t 3 >nul\r\n"
            "start http://localhost:5173\r\n"
        )
    else:
        launcher = REPO_ROOT / "start_edu_ai.sh"
        py = venv_python()
        open_cmd = "open" if IS_MAC else "xdg-open"
        launcher.write_text(
            "#!/usr/bin/env bash\n"
            f'cd "{BACKEND_DIR}" && "{py}" -m uvicorn app.main:app --port 8000 &\n'
            f'cd "{FRONTEND_DIR}" && npm run dev &\n'
            "sleep 3\n"
            f"{open_cmd} http://localhost:5173\n"
            "wait\n"
        )
        launcher.chmod(launcher.stat().st_mode | stat.S_IEXEC | stat.S_IXGRP | stat.S_IXOTH)
    print(f"Launcher written to {launcher}")
    return launcher


def desktop_dirs():
    """Returns every existing Desktop directory worth placing a shortcut in
    - the normal user Desktop, and a OneDrive-redirected Desktop, if present."""
    home = Path.home()
    candidates = [home / "Desktop"]

    onedrive_env = os.environ.get("OneDrive") or os.environ.get("ONEDRIVE")
    if onedrive_env:
        candidates.append(Path(onedrive_env) / "Desktop")
    candidates.append(home / "OneDrive" / "Desktop")

    seen, dirs = set(), []
    for d in candidates:
        if d.exists() and d.is_dir() and d not in seen:
            seen.add(d)
            dirs.append(d)
    return dirs


def create_shortcut_windows(desktop_dir: Path, launcher: Path):
    shortcut_path = desktop_dir / "Edu_Ai.lnk"
    try:
        import win32com.client  # type: ignore

        shell = win32com.client.Dispatch("WScript.Shell")
        shortcut = shell.CreateShortCut(str(shortcut_path))
        shortcut.Targetpath = str(launcher)
        shortcut.WorkingDirectory = str(REPO_ROOT)
        shortcut.IconLocation = str(launcher)
        shortcut.save()
        print(f"Shortcut created: {shortcut_path}")
    except ImportError:
        fallback = desktop_dir / "Edu_Ai.bat"
        shutil.copy(launcher, fallback)
        print(f"pywin32 not installed - copied a launcher to {fallback} instead of a .lnk shortcut.")


def create_shortcut_mac(desktop_dir: Path, launcher: Path):
    shortcut_path = desktop_dir / "Edu_Ai.command"
    shutil.copy(launcher, shortcut_path)
    shortcut_path.chmod(shortcut_path.stat().st_mode | stat.S_IEXEC | stat.S_IXGRP | stat.S_IXOTH)
    print(f"Shortcut created: {shortcut_path}")


def create_shortcut_linux(desktop_dir: Path, launcher: Path):
    shortcut_path = desktop_dir / "Edu_Ai.desktop"
    shortcut_path.write_text(
        "[Desktop Entry]\n"
        "Type=Application\n"
        "Name=Edu_Ai\n"
        f"Exec={launcher}\n"
        f"Path={REPO_ROOT}\n"
        "Terminal=true\n"
    )
    shortcut_path.chmod(shortcut_path.stat().st_mode | stat.S_IEXEC | stat.S_IXGRP | stat.S_IXOTH)
    print(f"Shortcut created: {shortcut_path}")


def create_shortcuts(launcher: Path):
    dirs = desktop_dirs()
    if not dirs:
        print("No Desktop directory found - skipping shortcut creation.")
        return
    for desktop_dir in dirs:
        if IS_WINDOWS:
            create_shortcut_windows(desktop_dir, launcher)
        elif IS_MAC:
            create_shortcut_mac(desktop_dir, launcher)
        else:
            create_shortcut_linux(desktop_dir, launcher)


def launch(launcher: Path):
    print(f"\n== Starting Edu_Ai ==\n$ {launcher}")
    if IS_WINDOWS:
        subprocess.Popen(["cmd", "/c", "start", "", str(launcher)], cwd=REPO_ROOT)
    else:
        subprocess.Popen([str(launcher)], cwd=REPO_ROOT)


def main():
    check_python_version()
    install_backend()
    install_frontend()
    launcher = write_launcher()
    create_shortcuts(launcher)
    print("\nInstall complete. Double-click the Edu_Ai desktop shortcut, or run "
          f"{launcher.name} directly, to start the app.")
    launch(launcher)


if __name__ == "__main__":
    main()
