"""Explainable personalized-learning engine.

The engine deliberately uses deterministic, inspectable rules rather than an
opaque model. Every mastery update retains evidence, review timing, and
misconception counts so recommendations can be explained to learners/parents.
"""

from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

from sqlalchemy import select

from app.database import session_scope
from app.models import ConceptMastery, User

BASE_DIR = Path(__file__).resolve().parent.parent
REVIEW_DAYS = (0, 1, 3, 7, 14, 30, 60)


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _slug(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-") or "concept"


def _user(session, profile: str) -> User:
    user = session.scalar(
        select(User).where(
            User.display_name == profile,
            User.deleted_at.is_(None),
            User.active.is_(True),
        )
    )
    if not user:
        raise LookupError("Unknown learner profile")
    return user


def curriculum_path(level_id: str) -> Path:
    normalized = str(level_id).strip().lower()
    if normalized.isdigit():
        return BASE_DIR / "syllabus" / f"grade{int(normalized)}.json"
    return BASE_DIR / "syllabus" / f"level_{normalized}.json"


def curriculum_concepts(level_id: str, subject_data: dict) -> list[dict]:
    """Create a stable knowledge map from authored lesson metadata."""
    concepts: dict[str, dict] = {}
    for position, lesson in enumerate(subject_data.get("lessons") or []):
        lesson_id = str(lesson.get("id") or f"lesson-{position + 1}")
        lesson_title = str(lesson.get("title") or lesson_id)
        names = lesson.get("key_concepts") or [lesson_title]
        for name in names:
            display = str(name).strip()
            if not display:
                continue
            key = _slug(display)
            entry = concepts.setdefault(
                key,
                {
                    "key": key,
                    "name": display,
                    "lesson_ids": [],
                    "lesson_titles": [],
                    "first_position": position,
                },
            )
            if lesson_id not in entry["lesson_ids"]:
                entry["lesson_ids"].append(lesson_id)
                entry["lesson_titles"].append(lesson_title)
    return sorted(concepts.values(), key=lambda item: (item["first_position"], item["name"]))


def _mastery(record: ConceptMastery, correct: bool, confidence: float) -> float:
    """Recency-weighted Bayesian estimate with a small prior."""
    old = float(record.mastery or 0.25)
    observed = 1.0 if correct else 0.0
    learning_rate = max(0.12, 0.34 / (1 + record.attempts * 0.08))
    confidence_weight = 0.7 + 0.3 * confidence
    return round(max(0.02, min(0.99, old + learning_rate * confidence_weight * (observed - old))), 4)


def _difficulty(mastery: float, streak: int, lapses: int) -> int:
    level = 1 + int(mastery >= 0.35) + int(mastery >= 0.58) + int(mastery >= 0.78)
    if mastery >= 0.9 and streak >= 3:
        level = 5
    if lapses >= 2 and streak == 0:
        level = max(1, level - 1)
    return level


def record_evidence(
    profile: str,
    level_id: str,
    subject: str,
    concept: str,
    correct: bool,
    *,
    lesson_id: str = "",
    question_id: str = "",
    answer: str = "",
    expected_answer: str = "",
    confidence: float = 1.0,
) -> dict:
    concept_name = concept.strip() or "General practice"
    concept_key = _slug(concept_name)
    confidence = max(0.0, min(1.0, float(confidence)))
    answered_at = _now()

    with session_scope() as session:
        user = _user(session, profile)
        record = session.scalar(
            select(ConceptMastery).where(
                ConceptMastery.user_id == user.id,
                ConceptMastery.level_id == str(level_id),
                ConceptMastery.subject == subject,
                ConceptMastery.concept_key == concept_key,
            )
        )
        if not record:
            record = ConceptMastery(
                user_id=user.id,
                level_id=str(level_id),
                subject=subject,
                concept_key=concept_key,
                concept_name=concept_name,
                next_review_at=answered_at,
            )
            session.add(record)
            session.flush()

        record.attempts += 1
        record.correct_attempts += int(correct)
        if correct:
            record.streak += 1
            record.interval_stage = min(record.interval_stage + 1, len(REVIEW_DAYS) - 1)
        else:
            record.streak = 0
            record.lapses += 1
            record.interval_stage = 0

        record.mastery = _mastery(record, correct, confidence)
        record.difficulty = _difficulty(record.mastery, record.streak, record.lapses)
        record.last_answered_at = answered_at
        record.next_review_at = answered_at + timedelta(days=REVIEW_DAYS[record.interval_stage])

        evidence = list((record.evidence or {}).get("recent", []))
        evidence.append(
            {
                "correct": correct,
                "lesson_id": lesson_id,
                "question_id": question_id,
                "answered_at": answered_at.isoformat(),
                "confidence": confidence,
            }
        )
        record.evidence = {"recent": evidence[-20:]}

        misconceptions = dict(record.misconceptions or {})
        if not correct:
            signature = _slug(answer or "incorrect-answer")[:100]
            item = dict(misconceptions.get(signature) or {})
            item["answer"] = answer[:300]
            item["expected_answer"] = expected_answer[:300]
            item["count"] = int(item.get("count", 0)) + 1
            item["last_seen_at"] = answered_at.isoformat()
            misconceptions[signature] = item
        record.misconceptions = misconceptions
        session.flush()
        return serialize_record(record, answered_at)


def serialize_record(record: ConceptMastery, now: datetime | None = None) -> dict:
    now = now or _now()
    review_at = record.next_review_at
    if review_at and review_at.tzinfo is None:
        review_at = review_at.replace(tzinfo=timezone.utc)
    repeated = [
        {"key": key, **value}
        for key, value in (record.misconceptions or {}).items()
        if int(value.get("count", 0)) >= 2
    ]
    repeated.sort(key=lambda item: (-int(item.get("count", 0)), item["key"]))
    return {
        "concept_key": record.concept_key,
        "concept_name": record.concept_name,
        "mastery": round(float(record.mastery or 0), 4),
        "mastery_percent": round(float(record.mastery or 0) * 100),
        "attempts": record.attempts,
        "correct_attempts": record.correct_attempts,
        "streak": record.streak,
        "lapses": record.lapses,
        "difficulty": record.difficulty,
        "difficulty_label": ("foundation", "supported", "standard", "challenge", "stretch")[record.difficulty - 1],
        "next_review_at": review_at.isoformat() if review_at else None,
        "review_due": bool(review_at and review_at <= now),
        "repeated_misconceptions": repeated,
    }


def build_profile(profile: str, level_id: str, subject: str, subject_data: dict) -> dict:
    map_items = curriculum_concepts(level_id, subject_data)
    now = _now()
    with session_scope() as session:
        user = _user(session, profile)
        rows = list(
            session.scalars(
                select(ConceptMastery).where(
                    ConceptMastery.user_id == user.id,
                    ConceptMastery.level_id == str(level_id),
                    ConceptMastery.subject == subject,
                )
            )
        )
    by_key = {row.concept_key: row for row in rows}
    concepts = []
    for item in map_items:
        row = by_key.get(item["key"])
        state = serialize_record(row, now) if row else {
            "concept_key": item["key"],
            "concept_name": item["name"],
            "mastery": 0.25,
            "mastery_percent": 25,
            "attempts": 0,
            "correct_attempts": 0,
            "streak": 0,
            "lapses": 0,
            "difficulty": 1,
            "difficulty_label": "foundation",
            "next_review_at": None,
            "review_due": False,
            "repeated_misconceptions": [],
        }
        concepts.append({**item, **state})

    due = [item for item in concepts if item["review_due"]]
    weak = sorted(concepts, key=lambda item: (item["mastery"], item["first_position"]))
    target = due[0] if due else (weak[0] if weak else None)
    next_lesson = None
    if target and target["lesson_ids"]:
        next_lesson = {
            "lesson_id": target["lesson_ids"][0],
            "lesson_title": target["lesson_titles"][0],
            "concept": target["concept_name"],
            "reason": "Spaced review is due" if target["review_due"] else "This is your least-mastered concept",
            "difficulty": target["difficulty"],
            "difficulty_label": target["difficulty_label"],
        }

    attempted = [item for item in concepts if item["attempts"]]
    overall = sum(item["mastery"] for item in attempted) / len(attempted) if attempted else 0.25
    misconceptions = [
        {"concept": item["concept_name"], **misconception}
        for item in concepts
        for misconception in item["repeated_misconceptions"]
    ]
    misconceptions.sort(key=lambda item: -int(item.get("count", 0)))
    return {
        "profile": profile,
        "level_id": str(level_id),
        "subject": subject,
        "overall_mastery": round(overall, 4),
        "overall_mastery_percent": round(overall * 100),
        "concepts": concepts,
        "knowledge_map": [
            {
                "concept_key": item["concept_key"],
                "concept_name": item["concept_name"],
                "lesson_ids": item["lesson_ids"],
                "mastery_percent": item["mastery_percent"],
            }
            for item in concepts
        ],
        "next_lesson": next_lesson,
        "reviews_due": len(due),
        "repeated_misconceptions": misconceptions[:10],
    }
