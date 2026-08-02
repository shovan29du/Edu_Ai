"""PDF Explainer: upload a PDF and get an AI-simplified explanation of its
contents (readable aloud via the browser's built-in text-to-speech, like
other content in this app), ask follow-up questions grounded in the
document, generate a quiz from its actual content, and save personal
notes against it.

Inspired by the pdf-teacher-master (ExplainIt) reference project, rebuilt
on this app's existing conventions: pypdf text extraction, local JSON
index storage (see resource_tab.py), and the ai_tutor module's Claude
calling machinery (see ai_tutor.py's explain_document/
answer_document_question/generate_quiz_from_text).
"""
from __future__ import annotations

import json
import uuid
from io import BytesIO
from pathlib import Path

from pypdf import PdfReader

from app import ai_tutor
from app.summarize import summarize

BASE_DIR = Path(__file__).resolve().parent.parent
PDF_EXPLAINER_DIR = BASE_DIR / "data" / "pdf_explainer"
PDF_EXPLAINER_DIR.mkdir(parents=True, exist_ok=True)
INDEX_PATH = PDF_EXPLAINER_DIR / "index.json"
NOTES_PATH = PDF_EXPLAINER_DIR / "notes.json"

MAX_PDF_BYTES = 20 * 1024 * 1024  # 20 MB


def _load(path: Path) -> list:
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _save(path: Path, records: list) -> None:
    with open(path, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)


def _without_text(record: dict) -> dict:
    return {k: v for k, v in record.items() if k != "text"}


def list_documents(child: str = "") -> list[dict]:
    docs = _load(INDEX_PATH)
    if child:
        docs = [d for d in docs if d.get("child") == child]
    return [_without_text(d) for d in docs]


def get_document(doc_id: str) -> dict | None:
    """Public metadata only (no full extracted text)."""
    for d in _load(INDEX_PATH):
        if d["id"] == doc_id:
            return _without_text(d)
    return None


def _get_full_record(doc_id: str) -> dict:
    for d in _load(INDEX_PATH):
        if d["id"] == doc_id:
            return d
    raise ValueError("Document not found")


def upload(filename: str, contents: bytes, child: str = "") -> dict:
    if not contents.lstrip().startswith(b"%PDF"):
        raise ValueError("File does not look like a valid PDF")
    if len(contents) > MAX_PDF_BYTES:
        raise ValueError("PDF is too large (max 20 MB)")
    try:
        reader = PdfReader(BytesIO(contents))
        page_count = len(reader.pages)
        text = "".join(page.extract_text() or "" for page in reader.pages)
    except Exception as exc:
        raise ValueError("Could not read this PDF") from exc
    if not text.strip():
        raise ValueError("Could not extract any readable text from this PDF (it may be a scanned image)")

    doc_id = uuid.uuid4().hex[:12]
    record = {
        "id": doc_id,
        "filename": filename,
        "child": child,
        "page_count": page_count,
        "char_count": len(text),
        "summary": summarize(text),
        "text": text,
    }
    docs = _load(INDEX_PATH)
    docs.append(record)
    _save(INDEX_PATH, docs)
    return _without_text(record)


def delete_document(doc_id: str) -> bool:
    docs = _load(INDEX_PATH)
    remaining = [d for d in docs if d["id"] != doc_id]
    if len(remaining) == len(docs):
        return False
    _save(INDEX_PATH, remaining)
    notes = _load(NOTES_PATH)
    _save(NOTES_PATH, [n for n in notes if n["doc_id"] != doc_id])
    return True


def explain(doc_id: str, level: str | None = None, grade: int = 1, age_group: str = "", language: str = "", difficulty: str = "") -> str:
    text = _get_full_record(doc_id)["text"]
    return ai_tutor.explain_document(
        text, grade=grade, level=level, age_group=age_group, language=language, difficulty=difficulty
    )


def ask(doc_id: str, question: str, level: str | None = None, grade: int = 1) -> str:
    text = _get_full_record(doc_id)["text"]
    return ai_tutor.answer_document_question(text, question, grade=grade, level=level)


def quiz(doc_id: str, count: int = 5, level: str | None = None, grade: int = 1) -> list[dict]:
    text = _get_full_record(doc_id)["text"]
    return ai_tutor.generate_quiz_from_text(text, grade=grade, count=count, level=level)


def list_notes(doc_id: str, child: str = "") -> list[dict]:
    notes = [n for n in _load(NOTES_PATH) if n["doc_id"] == doc_id]
    if child:
        notes = [n for n in notes if n.get("child") == child]
    return notes


def add_note(doc_id: str, text: str, child: str = "") -> dict:
    _get_full_record(doc_id)  # raises ValueError if missing
    note = {"id": uuid.uuid4().hex[:10], "doc_id": doc_id, "child": child, "text": text}
    notes = _load(NOTES_PATH)
    notes.append(note)
    _save(NOTES_PATH, notes)
    return note


def delete_note(note_id: str) -> bool:
    notes = _load(NOTES_PATH)
    remaining = [n for n in notes if n["id"] != note_id]
    if len(remaining) == len(notes):
        return False
    _save(NOTES_PATH, remaining)
    return True
