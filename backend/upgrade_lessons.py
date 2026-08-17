#!/usr/bin/env python3
"""
Upgrade all lessons across all grade syllabus files with CK-12-quality content.
Uses Claude Haiku to rewrite reading_material, learning_objectives, key_concepts,
practical_activities, exercises, quiz, homework, and revision for every lesson.

Run:  python upgrade_lessons.py [--grade 3] [--subject Science] [--dry-run]
Saves progress so it can be resumed if interrupted.
"""

import json
import os
import sys
import time
import argparse
from pathlib import Path

import anthropic

SYLLABUS_DIR = Path(__file__).parent / "syllabus"
PROGRESS_FILE = Path(__file__).parent / "data" / "upgrade_progress.json"
API_KEY = os.getenv("ANTHROPIC_API_KEY", "")

SYSTEM_PROMPT = """You are a master curriculum writer producing CK-12 FlexBook quality lessons for children.
Your lessons are:
- Age-appropriate, warm, and encouraging
- Rich with real-world examples, analogies, and storytelling
- Structured clearly: hook → explain → example → check → apply
- Full of curiosity-sparking "did you know?" moments
- Absolutely child-safe with no adult content

Return ONLY valid JSON — no markdown fences, no extra text."""


def load_progress():
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text())
    return {}


def save_progress(progress):
    PROGRESS_FILE.parent.mkdir(parents=True, exist_ok=True)
    PROGRESS_FILE.write_text(json.dumps(progress, indent=2))


def upgrade_lesson(client, lesson: dict, grade: int, subject: str) -> dict:
    """Call Claude to upgrade a single lesson. Returns upgraded lesson dict."""

    difficulty = lesson.get("difficulty", "elementary")
    title = lesson.get("title", "Lesson")
    unit = lesson.get("unit", "")
    existing_objectives = lesson.get("learning_objectives", [])
    existing_concepts = lesson.get("key_concepts", [])

    age_map = {
        1: "6–7", 2: "7–8", 3: "8–9", 4: "9–10", 5: "10–11",
        6: "11–12", 7: "12–13", 8: "13–14", 9: "14–15", 10: "15–16"
    }
    age = age_map.get(grade, "10–12")

    prompt = f"""Upgrade this lesson to CK-12 FlexBook quality for Grade {grade} students (age {age}).

Lesson: "{title}"
Subject: {subject}
Unit: {unit}
Difficulty: {difficulty}
Current objectives: {existing_objectives}
Current key concepts: {existing_concepts}

Return a JSON object with EXACTLY these keys:
{{
  "learning_objectives": [3-5 clear, measurable objectives starting with action verbs],
  "reading_material": "600-900 word rich lesson text. Structure: 1) Engaging hook with a real-world scenario or question. 2) Core concept explained with simple language + a vivid analogy. 3) 2-3 worked examples with step-by-step thinking shown. 4) A 'Did You Know?' interesting fact. 5) Common misconceptions addressed. 6) Real-world connections. 7) Summary recap in 3 bullet points. Write conversationally, as if talking to the student.",
  "key_concepts": [6-10 vocabulary words relevant to this lesson],
  "vocabulary": [{{"word": "...", "definition": "child-friendly definition in one sentence"}}],
  "practical_activities": ["3-4 hands-on activities students can do at home or school"],
  "exercises": [
    {{"q": "question text", "type": "mcq", "options": ["A", "B", "C", "D"], "answer": "correct option text", "explanation": "why this is correct"}},
    {{"q": "question text", "type": "mcq", "options": ["A", "B", "C", "D"], "answer": "correct option text", "explanation": "why this is correct"}},
    {{"q": "question text", "type": "mcq", "options": ["A", "B", "C", "D"], "answer": "correct option text", "explanation": "why this is correct"}}
  ],
  "quiz": {{
    "questions": [
      {{"q": "question", "options": ["A","B","C","D"], "answer": "correct", "explanation": "brief reason"}},
      {{"q": "question", "options": ["A","B","C","D"], "answer": "correct", "explanation": "brief reason"}},
      {{"q": "question", "options": ["A","B","C","D"], "answer": "correct", "explanation": "brief reason"}},
      {{"q": "question", "options": ["A","B","C","D"], "answer": "correct", "explanation": "brief reason"}},
      {{"q": "question", "options": ["A","B","C","D"], "answer": "correct", "explanation": "brief reason"}}
    ]
  }},
  "homework": {{"task": "meaningful real-world task using today's lesson", "due": "next_class"}},
  "revision": {{"notes": "3 bullet-point summary of the most important ideas", "tip": "memory trick or study strategy for this specific topic"}},
  "fun_fact": "one amazing, age-appropriate fact related to this lesson",
  "real_world_connection": "one paragraph showing where this topic appears in everyday life"
}}"""

    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    text = resp.content[0].text.strip()
    # Strip markdown fences if present
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    text = text.strip().rstrip("```").strip()

    upgrade = json.loads(text)
    return upgrade


def apply_upgrade(lesson: dict, upgrade: dict) -> dict:
    """Merge upgrade into existing lesson, preserving structural fields."""
    updated = dict(lesson)
    for key in [
        "learning_objectives", "reading_material", "key_concepts",
        "vocabulary", "practical_activities", "exercises", "quiz",
        "homework", "revision", "fun_fact", "real_world_connection",
    ]:
        if key in upgrade:
            updated[key] = upgrade[key]
    return updated


def process_grade(client, grade_file: Path, target_subject: str | None, dry_run: bool, progress: dict):
    grade_name = grade_file.stem  # e.g. "grade3"
    print(f"\n{'='*60}")
    print(f"Processing {grade_name}")
    print(f"{'='*60}")

    data = json.loads(grade_file.read_text("utf-8"))
    modified = False

    for subject, subj_data in data.get("subjects", {}).items():
        if target_subject and subject != target_subject:
            continue

        lessons = subj_data.get("lessons", [])
        print(f"\n  {subject}: {len(lessons)} lessons")

        for i, lesson in enumerate(lessons):
            lesson_id = lesson.get("id", f"{grade_name}-{subject}-{i}")
            prog_key = lesson_id

            if progress.get(prog_key) == "done":
                print(f"    [{i+1}/{len(lessons)}] {lesson['title'][:50]} — skipped (already done)")
                continue

            print(f"    [{i+1}/{len(lessons)}] {lesson['title'][:50]}…", end=" ", flush=True)

            if dry_run:
                print("DRY RUN")
                continue

            for attempt in range(3):
                try:
                    grade_num = int("".join(c for c in grade_name if c.isdigit()) or "5")
                    upgrade = upgrade_lesson(client, lesson, grade_num, subject)
                    lessons[i] = apply_upgrade(lesson, upgrade)
                    progress[prog_key] = "done"
                    modified = True
                    print("✓")
                    break
                except json.JSONDecodeError as e:
                    print(f"JSON error (attempt {attempt+1}): {e}", end=" ")
                    time.sleep(2)
                except anthropic.RateLimitError:
                    wait = 30 * (attempt + 1)
                    print(f"rate limit, waiting {wait}s…", end=" ", flush=True)
                    time.sleep(wait)
                except Exception as e:
                    print(f"error: {type(e).__name__}: {e} (attempt {attempt+1})", end=" ")
                    time.sleep(5)
            else:
                print("FAILED — skipping")
                progress[prog_key] = "failed"

            # Save progress + file every 5 lessons
            if modified and (i + 1) % 5 == 0:
                grade_file.write_text(json.dumps(data, indent=2, ensure_ascii=False))
                save_progress(progress)
                print(f"    💾 Saved checkpoint ({i+1}/{len(lessons)})")

            time.sleep(0.5)  # gentle rate limiting

    if modified and not dry_run:
        grade_file.write_text(json.dumps(data, indent=2, ensure_ascii=False))
        save_progress(progress)
        print(f"\n  ✅ {grade_name} saved.")

    return progress


def main():
    parser = argparse.ArgumentParser(description="Upgrade EduAI syllabus lessons to CK-12 quality")
    parser.add_argument("--grade", type=int, help="Process only this grade (1-10)")
    parser.add_argument("--subject", type=str, help="Process only this subject")
    parser.add_argument("--dry-run", action="store_true", help="Preview without making changes")
    parser.add_argument("--reset", action="store_true", help="Clear progress and restart")
    args = parser.parse_args()

    if not API_KEY:
        print("ERROR: ANTHROPIC_API_KEY not set.")
        sys.exit(1)

    client = anthropic.Anthropic(api_key=API_KEY)
    progress = {} if args.reset else load_progress()

    grade_files = sorted(SYLLABUS_DIR.glob("grade*.json"))
    if args.grade:
        grade_files = [f for f in grade_files if f.stem == f"grade{args.grade}"]

    if not grade_files:
        print("No grade files found.")
        sys.exit(1)

    total = sum(
        len(json.loads(f.read_text())["subjects"].get(args.subject, {}).get("lessons", [])
            if args.subject else
            [l for s in json.loads(f.read_text())["subjects"].values() for l in s.get("lessons", [])])
        for f in grade_files
    )
    done = sum(1 for v in progress.values() if v == "done")
    print(f"\n🎓 EduAI Lesson Upgrader")
    print(f"   Files to process: {len(grade_files)}")
    print(f"   Lessons total (approx): {total}")
    print(f"   Already done: {done}")
    if args.dry_run:
        print("   MODE: DRY RUN")
    print()

    for grade_file in grade_files:
        progress = process_grade(client, grade_file, args.subject, args.dry_run, progress)

    print("\n🎉 All done!")
    done_count = sum(1 for v in progress.values() if v == "done")
    failed_count = sum(1 for v in progress.values() if v == "failed")
    print(f"   ✅ Upgraded: {done_count}")
    print(f"   ❌ Failed: {failed_count}")


if __name__ == "__main__":
    main()
