import json
from pathlib import Path
from threading import Lock

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

ALLOWED_CHILDREN = {"Aliza", "Saifan"}
PARENT_PROFILE = "Parent"
ALL_PROFILES = (*sorted(ALLOWED_CHILDREN), PARENT_PROFILE)
_lock = Lock()


def _progress_path(child: str) -> Path:
    return DATA_DIR / f"progress_{child}.json"


def _activity_path(child: str) -> Path:
    return DATA_DIR / f"activity_{child}.json"


def get_progress(child: str) -> dict:
    path = _progress_path(child)
    if not path.exists():
        return {"scores": {}, "badges": [], "mastery": {}, "snippets": {}, "completed_lessons": {}}
    with open(path) as f:
        data = json.load(f)
    data.setdefault("completed_lessons", {})
    return data


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
        if "completed_lessons" in update:
            current.setdefault("completed_lessons", {})
            for subject, lesson_ids in update["completed_lessons"].items():
                existing = current["completed_lessons"].setdefault(subject, [])
                for lesson_id in lesson_ids:
                    if lesson_id not in existing:
                        existing.append(lesson_id)
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
