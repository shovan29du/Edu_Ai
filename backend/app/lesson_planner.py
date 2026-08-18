"""AI Lesson & Term Planner: generate a sequential, term-length lesson plan
for a subject and level, automatically scheduled across weekdays, and let
the teacher move individual lessons to a different date afterwards.

Inspired by the ai-teacher-planner-main (ClassCraft.AI) reference project,
rebuilt on this app's existing conventions: local JSON index storage (see
resource_tab.py / pdf_explainer.py) and the ai_tutor module's Claude calling
machinery (see ai_tutor.py's generate_lesson_plan).
"""
from __future__ import annotations

import json
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path

from app import ai_tutor

BASE_DIR = Path(__file__).resolve().parent.parent
LESSON_PLANNER_DIR = BASE_DIR / "data" / "lesson_planner"
LESSON_PLANNER_DIR.mkdir(parents=True, exist_ok=True)
INDEX_PATH = LESSON_PLANNER_DIR / "index.json"

MAX_LESSONS = 40


def _load() -> list:
    if not INDEX_PATH.exists():
        return []
    with open(INDEX_PATH, encoding="utf-8") as f:
        return json.load(f)


def _save(records: list) -> None:
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)


def _schedule_dates(start: date, lesson_count: int, lessons_per_week: int) -> list[str]:
    lessons_per_week = max(1, min(lessons_per_week, 5))
    dates: list[str] = []
    scheduled_this_week = 0
    current = start
    while len(dates) < lesson_count:
        if current.weekday() < 5 and scheduled_this_week < lessons_per_week:
            dates.append(current.isoformat())
            scheduled_this_week += 1
        if current.weekday() == 6:
            scheduled_this_week = 0
        current += timedelta(days=1)
    return dates


def generate_plan(
    owner_id: str, subject: str, term_name: str, start_date: str,
    lesson_count: int = 10, lessons_per_week: int = 3,
    level: str | None = None, grade: int = 1, notes: str = "",
) -> dict:
    lesson_count = max(1, min(int(lesson_count), MAX_LESSONS))
    try:
        parsed_start = datetime.strptime(start_date, "%Y-%m-%d").date()
    except ValueError as exc:
        raise ValueError("start_date must be in YYYY-MM-DD format") from exc

    generated = ai_tutor.generate_lesson_plan(
        subject, term_name, lesson_count=lesson_count, grade=grade, level=level, notes=notes,
    )
    dates = _schedule_dates(parsed_start, len(generated) or lesson_count, lessons_per_week)

    lessons = []
    for i, lesson in enumerate(generated):
        lessons.append({
            "id": uuid.uuid4().hex[:10],
            "title": lesson["title"],
            "objectives": lesson["objectives"],
            "content": lesson["content"],
            "date": dates[i] if i < len(dates) else None,
        })

    plan = {
        "id": uuid.uuid4().hex[:12],
        "owner_id": owner_id,
        "subject": subject,
        "term_name": term_name,
        "level": level,
        "start_date": start_date,
        "lessons_per_week": lessons_per_week,
        "lessons": lessons,
    }
    plans = _load()
    plans.append(plan)
    _save(plans)
    return plan


def list_plans(owner_id: str = "") -> list[dict]:
    plans = _load()
    if owner_id:
        plans = [p for p in plans if p.get("owner_id") == owner_id]
    return plans


def get_plan(plan_id: str) -> dict | None:
    for p in _load():
        if p["id"] == plan_id:
            return p
    return None


def delete_plan(plan_id: str) -> bool:
    plans = _load()
    remaining = [p for p in plans if p["id"] != plan_id]
    if len(remaining) == len(plans):
        return False
    _save(remaining)
    return True


def reschedule_lesson(plan_id: str, lesson_id: str, new_date: str) -> dict | None:
    try:
        datetime.strptime(new_date, "%Y-%m-%d")
    except ValueError as exc:
        raise ValueError("new_date must be in YYYY-MM-DD format") from exc

    plans = _load()
    for plan in plans:
        if plan["id"] != plan_id:
            continue
        for lesson in plan["lessons"]:
            if lesson["id"] == lesson_id:
                lesson["date"] = new_date
                _save(plans)
                return plan
        raise ValueError("Lesson not found")
    return None
