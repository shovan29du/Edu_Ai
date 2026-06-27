import json
from datetime import date, timedelta
from pathlib import Path
from threading import Lock

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

ALLOWED_CHILDREN = {"Aliza", "Saifan"}
PARENT_PROFILE = "Parent"
PARENT_PROFILES = {"Parent", "Shovan", "Bely"}
ALL_PROFILES = (*sorted(ALLOWED_CHILDREN), *sorted(PARENT_PROFILES))
_lock = Lock()

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
    with open(path) as f:
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
