import json
from datetime import date, timedelta
from pathlib import Path
from threading import Lock

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

# Static defaults (used when users.json doesn't exist yet)
_DEFAULT_CHILDREN = ["Aliza", "Saifan"]
_DEFAULT_PARENTS  = ["Parent", "Shovan", "Bely"]
PROTECTED_PARENT  = "Parent"   # can never be deleted or renamed

# Legacy constants kept for import compatibility
ALLOWED_CHILDREN = set(_DEFAULT_CHILDREN)
PARENT_PROFILE   = "Parent"
PARENT_PROFILES  = set(_DEFAULT_PARENTS)
ALL_PROFILES     = (*sorted(ALLOWED_CHILDREN), *sorted(PARENT_PROFILES))

_lock = Lock()
_users_path = DATA_DIR / "users.json"


def _load_users() -> dict:
    if _users_path.exists():
        try:
            with open(_users_path, encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"children": list(_DEFAULT_CHILDREN), "parents": list(_DEFAULT_PARENTS)}


def _save_users(data: dict) -> None:
    with open(_users_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def get_children() -> list[str]:
    return _load_users()["children"]


def get_all_parent_profiles() -> list[str]:
    return _load_users()["parents"]


def get_all_profiles() -> list[str]:
    u = _load_users()
    return sorted(u["children"]) + sorted(u["parents"])


def add_user(name: str, role: str) -> dict:
    """role: 'child' or 'parent'. Returns updated users dict."""
    with _lock:
        data = _load_users()
        all_names = data["children"] + data["parents"]
        if name in all_names:
            raise ValueError(f"User '{name}' already exists")
        if role == "child":
            data["children"].append(name)
        else:
            data["parents"].append(name)
        _save_users(data)
        return data


def rename_user(old_name: str, new_name: str) -> dict:
    with _lock:
        data = _load_users()
        if old_name == PROTECTED_PARENT:
            raise ValueError("Cannot rename the Parent account")
        all_names = data["children"] + data["parents"]
        if old_name not in all_names:
            raise ValueError(f"User '{old_name}' not found")
        if new_name in all_names:
            raise ValueError(f"Name '{new_name}' already taken")
        for lst in ("children", "parents"):
            data[lst] = [new_name if n == old_name else n for n in data[lst]]
        _save_users(data)
        return data


def delete_user(name: str) -> dict:
    with _lock:
        data = _load_users()
        if name == PROTECTED_PARENT:
            raise ValueError("Cannot delete the Parent account")
        removed = False
        for lst in ("children", "parents"):
            if name in data[lst]:
                data[lst].remove(name)
                removed = True
        if not removed:
            raise ValueError(f"User '{name}' not found")
        _save_users(data)
        return data

STREAK_BADGE_MILESTONES = (3, 7, 14, 30)


def _today() -> date:
    return date.today()


def _current_streak(lesson_dates: list) -> int:
    days = sorted({date.fromisoformat(d) for d in lesson_dates}, reverse=True)
    if not days:
        return 0
    today = _today()
    if days[0] not in (today, today - timedelta(days=1)):
        return 0
    streak = 1
    for i in range(1, len(days)):
        if days[i - 1] - days[i] == timedelta(days=1):
            streak += 1
        else:
            break
    return streak


def _progress_path(child: str) -> Path:
    return DATA_DIR / f"progress_{child}.json"


def _activity_path(child: str) -> Path:
    return DATA_DIR / f"activity_{child}.json"


def get_progress(child: str) -> dict:
    path = _progress_path(child)
    if not path.exists():
        return {
            "scores": {},
            "badges": [],
            "mastery": {},
            "snippets": {},
            "completed_lessons": {},
            "lesson_streak_dates": [],
            "lesson_streak": 0,
        }
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
    data.setdefault("completed_lessons", {})
    data.setdefault("lesson_streak_dates", [])
    data["lesson_streak"] = _current_streak(data["lesson_streak_dates"])
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
            gained_lesson = False
            for subject, lesson_ids in update["completed_lessons"].items():
                existing = current["completed_lessons"].setdefault(subject, [])
                for lesson_id in lesson_ids:
                    if lesson_id not in existing:
                        existing.append(lesson_id)
                        gained_lesson = True
            if gained_lesson:
                dates = current.setdefault("lesson_streak_dates", [])
                today_str = _today().isoformat()
                if today_str not in dates:
                    dates.append(today_str)
                streak = _current_streak(dates)
                current["lesson_streak"] = streak
                badges = current.setdefault("badges", [])
                for milestone in STREAK_BADGE_MILESTONES:
                    if streak >= milestone:
                        badge = f"lesson-streak-{milestone}"
                        if badge not in badges:
                            badges.append(badge)
        with open(_progress_path(child), "w", encoding="utf-8") as f:
            json.dump(current, f, indent=2)
        return current


def get_activity_log(child: str) -> list:
    path = _activity_path(child)
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def append_activity(child: str, entry: dict) -> list:
    with _lock:
        log = get_activity_log(child)
        log.append(entry)
        log = log[-50:]
        with open(_activity_path(child), "w", encoding="utf-8") as f:
            json.dump(log, f, indent=2)
        return log


# ── Homework ──────────────────────────────────────────────────────────────────

def _homework_path(child: str) -> Path:
    return DATA_DIR / f"homework_{child}.json"


def get_homework(child: str) -> list:
    path = _homework_path(child)
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def save_homework(child: str, items: list) -> list:
    with _lock:
        with open(_homework_path(child), "w", encoding="utf-8") as f:
            json.dump(items, f, indent=2)
        return items


# ── Reading Log ───────────────────────────────────────────────────────────────

def _reading_log_path(child: str) -> Path:
    return DATA_DIR / f"reading_log_{child}.json"


def get_reading_log(child: str) -> list:
    path = _reading_log_path(child)
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def append_reading_entry(child: str, entry: dict) -> list:
    with _lock:
        log = get_reading_log(child)
        log.append(entry)
        with open(_reading_log_path(child), "w", encoding="utf-8") as f:
            json.dump(log, f, indent=2)
        return log


# ── Screen Time ───────────────────────────────────────────────────────────────

def _screen_time_path(child: str) -> Path:
    return DATA_DIR / f"screen_time_{child}.json"


def get_screen_time(child: str) -> dict:
    path = _screen_time_path(child)
    if not path.exists():
        return {}
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def add_screen_time(child: str, minutes: int, date_str: str | None = None) -> dict:
    with _lock:
        data = get_screen_time(child)
        key = date_str or _today().isoformat()
        data[key] = data.get(key, 0) + minutes
        with open(_screen_time_path(child), "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return data
