"""When a scanned local book is identified as literature or non-fiction
with a known title and author (see the Resource Tab's "Analyze" button,
ai_tutor.analyze_book_for_library), any existing book entry that matches it
-- in the World Literature library, the Non-Fiction Library, or in a
subject's "books"/"textbooks" lesson resources across every grade/level
syllabus -- has its link replaced with the local copy, since the local
file should win once matched. If no matching entry exists in World
Literature or the Non-Fiction Library, a new one is created in a catch-all
"local" section/category so the book is still browsable there.

Matching is by normalized title plus author last name (full names rarely
match exactly between a personal file and curated data -- middle names,
"Jr.", diacritics, etc. -- so last name is precise enough while staying
tolerant), never title alone, to avoid two different books with the same
title colliding.
"""

import json
import re
from pathlib import Path
from threading import Lock

BASE_DIR = Path(__file__).resolve().parent.parent
SYLLABUS_DIR = BASE_DIR / "syllabus"
WLIT_PATH = BASE_DIR / "data" / "world_literature" / "library.json"
NONFICTION_PATH = BASE_DIR / "data" / "nonfiction_library" / "nonfiction.json"

LOCAL_SECTION_KEY = "local"

_lock = Lock()


def _normalize(value: str) -> str:
    value = re.sub(r"[^a-z0-9 ]", "", (value or "").lower())
    return re.sub(r"\s+", " ", value).strip()


_NAME_SUFFIXES = {"jr", "jr.", "sr", "sr.", "ii", "iii", "iv"}


def _last_name(author: str) -> str:
    parts = [p for p in (author or "").split() if p.strip(".").lower() not in _NAME_SUFFIXES]
    return _normalize(parts[-1]) if parts else ""


def _titles_match(a: str, b: str) -> bool:
    a, b = _normalize(a), _normalize(b)
    return bool(a) and a == b


def _authors_match(a: str, b: str) -> bool:
    la, lb = _last_name(a), _last_name(b)
    return bool(la) and la == lb


def sync_syllabus_books(title: str, author: str, local_open_url: str) -> list[dict]:
    """Replaces the link of every matching "books"/"textbooks" lesson
    resource across the syllabus with the local copy. Returns what changed."""
    updated = []
    for path in sorted(SYLLABUS_DIR.glob("*.json")):
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        changed = False
        for subject_name, subject in data.get("subjects", {}).items():
            if not isinstance(subject, dict):
                continue
            for resource_key in ("books", "textbooks"):
                for item in subject.get(resource_key, None) or []:
                    if not isinstance(item, dict):
                        continue
                    if _titles_match(item.get("title", ""), title) and _authors_match(item.get("author", ""), author):
                        item["link"] = local_open_url
                        item["local_copy"] = True
                        changed = True
                        updated.append({"file": path.name, "subject": subject_name, "title": item.get("title")})
        if changed:
            with _lock:
                path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    return updated


def _slug_id(title: str, author: str, existing_ids: set[str]) -> str:
    base = _normalize(f"{title}-{author}").replace(" ", "-")[:80] or "local-book"
    candidate = base
    suffix = 2
    while candidate in existing_ids:
        candidate = f"{base}-{suffix}"
        suffix += 1
    return candidate


def sync_world_literature(title: str, author: str, local_open_url: str, synopsis: str = "") -> dict:
    """Finds the World Literature entry matching (title, author); replaces
    its primary read link with the local copy and, if given, its summary
    with the synopsis. Creates a new entry in the "local" section when no
    existing one matches. Returns {section, book_id, title, created}."""
    with _lock:
        data = json.loads(WLIT_PATH.read_text(encoding="utf-8"))
        sections = data.setdefault("sections", {})

        for section_key, section in sections.items():
            for book in section.get("books", []):
                if _titles_match(book.get("title", ""), title) and _authors_match(book.get("author", ""), author):
                    links = book.setdefault("links", {})
                    links["read_online"] = local_open_url
                    links["local_copy"] = True
                    if synopsis:
                        book["summary"] = synopsis
                    WLIT_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
                    return {"section": section_key, "book_id": book["id"], "title": book["title"], "created": False}

        local_section = sections.setdefault(
            LOCAL_SECTION_KEY,
            {"label": "My Local Library", "emoji": "🏠", "age_range": "All ages", "books": []},
        )
        existing_ids = {b["id"] for b in local_section["books"]}
        book_id = _slug_id(title, author, existing_ids)
        local_section["books"].append({
            "id": book_id,
            "title": title,
            "author": author,
            "year": "",
            "origin": "",
            "summary": synopsis,
            "links": {"read_online": local_open_url, "local_copy": True},
        })
        WLIT_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        return {"section": LOCAL_SECTION_KEY, "book_id": book_id, "title": title, "created": True}


def sync_nonfiction_library(title: str, author: str, local_open_url: str, synopsis: str = "") -> dict:
    """Finds the Non-Fiction Library entry matching (title, author);
    replaces its primary read link with the local copy and, if given, its
    summary with the (800-1500 word) synopsis. Creates a new entry in the
    "local" category when no existing one matches. Returns
    {category, book_id, title, created}."""
    with _lock:
        data = json.loads(NONFICTION_PATH.read_text(encoding="utf-8"))
        categories = data.setdefault("categories", {})

        for category_key, category in categories.items():
            for book in category.get("books", []):
                if _titles_match(book.get("title", ""), title) and _authors_match(book.get("author", ""), author):
                    links = book.setdefault("links", {})
                    links["read_online"] = local_open_url
                    links["local_copy"] = True
                    if synopsis:
                        book["summary"] = synopsis
                    NONFICTION_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
                    return {"category": category_key, "book_id": book["id"], "title": book["title"], "created": False}

        local_category = categories.setdefault(
            LOCAL_SECTION_KEY,
            {"label": "My Local Library", "emoji": "🏠", "books": []},
        )
        existing_ids = {b["id"] for b in local_category["books"]}
        book_id = _slug_id(title, author, existing_ids)
        local_category["books"].append({
            "id": book_id,
            "title": title,
            "author": author,
            "summary": synopsis,
            "links": {"read_online": local_open_url, "local_copy": True},
        })
        NONFICTION_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
        return {"category": LOCAL_SECTION_KEY, "book_id": book_id, "title": title, "created": True}
