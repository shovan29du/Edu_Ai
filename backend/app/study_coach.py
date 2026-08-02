"""Study Coach: AI-generated spaced-repetition study questions (multiple-
choice and open-ended), combining retrieval practice, interleaving across
topics, and confidence tracking -- research-backed techniques popularised
by "Make It Stick".

Inspired by the studorama-main reference project, rebuilt on this app's
existing conventions: local JSON index storage (see resource_tab.py /
pdf_explainer.py) and the ai_tutor module's Claude-calling machinery,
using a simplified SM-2 spaced-repetition schedule instead of a
multi-provider AI abstraction layer.
"""
from __future__ import annotations

import json
import random
import uuid
from datetime import date, timedelta
from pathlib import Path

from app import ai_tutor

BASE_DIR = Path(__file__).resolve().parent.parent
STUDY_COACH_DIR = BASE_DIR / "data" / "study_coach"
STUDY_COACH_DIR.mkdir(parents=True, exist_ok=True)
INDEX_PATH = STUDY_COACH_DIR / "index.json"

MAX_QUESTIONS_PER_REQUEST = 15
MASTERED_INTERVAL_DAYS = 21


def _load() -> list:
    if not INDEX_PATH.exists():
        return []
    with open(INDEX_PATH, encoding="utf-8") as f:
        return json.load(f)


def _save(records: list) -> None:
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)


def _quality_from_result(correct: bool, confidence: int) -> int:
    """Map an answer's correctness plus the learner's self-rated confidence
    (1-5) onto SM-2's 0-5 quality scale."""
    confidence = max(1, min(int(confidence or 3), 5))
    if correct:
        return min(5, 2 + confidence)
    return max(0, confidence - 3)


def _sm2_update(record: dict, quality: int) -> None:
    ease = record.get("ease", 2.5)
    interval = record.get("interval_days", 0)
    review_count = record.get("review_count", 0)

    if quality < 3:
        review_count = 0
        interval = 1
    else:
        review_count += 1
        if review_count == 1:
            interval = 1
        elif review_count == 2:
            interval = 6
        else:
            interval = round(interval * ease)

    ease = max(1.3, ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
    record["ease"] = round(ease, 2)
    record["interval_days"] = interval
    record["review_count"] = review_count
    record["due_date"] = (date.today() + timedelta(days=interval)).isoformat()


def generate_questions(
    child: str, topic: str, subject: str = "", grade: int = 1, level: str | None = None,
    count: int = 6, mode: str = "mixed",
) -> list[dict]:
    count = max(1, min(int(count), MAX_QUESTIONS_PER_REQUEST))
    generated = ai_tutor.generate_study_questions(
        topic, subject=subject, grade=grade, level=level, count=count, mode=mode,
    )
    records = _load()
    created = []
    today = date.today().isoformat()
    for q in generated:
        record = {
            "id": uuid.uuid4().hex[:10],
            "child": child,
            "topic": topic,
            "subject": subject,
            "level": level,
            "type": q["type"],
            "question": q["question"],
            "options": q.get("options"),
            "answer": q.get("answer"),
            "key_points": q.get("key_points"),
            "explanation": q.get("explanation", ""),
            "ease": 2.5,
            "interval_days": 0,
            "review_count": 0,
            "due_date": today,
            "created_at": today,
        }
        records.append(record)
        created.append(record)
    _save(records)
    return created


def list_due_questions(child: str, limit: int = 20) -> list[dict]:
    today = date.today().isoformat()
    due = [r for r in _load() if r["child"] == child and r["due_date"] <= today]

    by_topic: dict[str, list[dict]] = {}
    for r in due:
        by_topic.setdefault(r["topic"], []).append(r)
    for group in by_topic.values():
        random.shuffle(group)

    interleaved = []
    while any(by_topic.values()):
        for topic in list(by_topic.keys()):
            group = by_topic[topic]
            if group:
                interleaved.append(group.pop())
            if not group:
                del by_topic[topic]
    return interleaved[:limit]


def _get_record(records: list, question_id: str) -> dict | None:
    for r in records:
        if r["id"] == question_id:
            return r
    return None


def submit_answer(child: str, question_id: str, given_answer: str, confidence: int = 3) -> dict:
    records = _load()
    record = _get_record(records, question_id)
    if not record or record["child"] != child:
        raise ValueError("Question not found")

    if record["type"] == "mcq":
        correct = given_answer.strip().upper() == (record.get("answer") or "").strip().upper()
        score = 100 if correct else 0
        feedback = record.get("explanation", "")
    else:
        graded = ai_tutor.grade_open_answer(
            record["question"], record.get("key_points") or [], given_answer, level=record.get("level"),
        )
        score = graded["score"]
        feedback = graded["feedback"]
        correct = score >= 70

    quality = _quality_from_result(correct, confidence)
    _sm2_update(record, quality)
    record["last_answer"] = given_answer
    record["last_confidence"] = confidence
    record["last_score"] = score
    _save(records)

    return {
        "correct": correct,
        "score": score,
        "feedback": feedback,
        "correct_answer": record.get("answer"),
        "explanation": record.get("explanation", ""),
        "next_due_date": record["due_date"],
        "interval_days": record["interval_days"],
    }


def stats(child: str) -> dict:
    mine = [r for r in _load() if r["child"] == child]
    today = date.today().isoformat()
    mastered = [r for r in mine if r["interval_days"] >= MASTERED_INTERVAL_DAYS]
    due_today = [r for r in mine if r["due_date"] <= today]
    topics = sorted({r["topic"] for r in mine})
    return {
        "total_questions": len(mine),
        "due_today": len(due_today),
        "mastered": len(mastered),
        "topics": topics,
    }


def delete_topic(child: str, topic: str) -> int:
    records = _load()
    remaining = [r for r in records if not (r["child"] == child and r["topic"] == topic)]
    deleted = len(records) - len(remaining)
    if deleted:
        _save(remaining)
    return deleted
