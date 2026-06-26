import json
from pathlib import Path
from threading import Lock

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

ALLOWED_CHILDREN = {"Aliza", "Saifan"}
_lock = Lock()


def _progress_path(child: str) -> Path:
    return DATA_DIR / f"progress_{child}.json"


def _activity_path(child: str) -> Path:
    return DATA_DIR / f"activity_{child}.json"


def get_progress(child: str) -> dict:
    path = _progress_path(child)
    if not path.exists():
        return {"scores": {}, "badges": [], "mastery": {}, "snippets": {}}
    with open(path) as f:
        return json.load(f)


def save_progress(child: str, update: dict) -> dict:
    with _lock:
        current = get_progress(child)
        for key in ("scores", "mastery", "snippets"):
            if key in update:
                current.setdefault(key, {}).update(update[key])
        if "badges" in update:
            current.setdefault("badges", [])
            for badge in update["badges"]:
                if badge not in current["badges"]:
                    current["badges"].append(badge)
        with open(_progress_path(child), "w") as f:
            json.dump(current, f, indent=2)
        return current


def get_activity_log(child: str) -> list:
    path = _activity_path(child)
    if not path.exists():
        return []
    with open(path) as f:
        return json.load(f)


def append_activity(child: str, entry: dict) -> list:
    with _lock:
        log = get_activity_log(child)
        log.append(entry)
        log = log[-50:]
        with open(_activity_path(child), "w") as f:
            json.dump(log, f, indent=2)
        return log
