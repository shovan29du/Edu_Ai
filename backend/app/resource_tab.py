"""Resource Tab: lets a parent upload their own documents (PDF/DOCX/TXT),
extracts the text, and links the document to matching syllabus topics so it
shows up alongside the relevant subject in the app. No external services —
extraction and topic matching are done locally from the uploaded file and
the existing local syllabus JSON files."""

import json
import re
import uuid
from io import BytesIO
from pathlib import Path

from docx import Document
from pypdf import PdfReader

from app.summarize import summarize

BASE_DIR = Path(__file__).resolve().parent.parent
SYLLABUS_DIR = BASE_DIR / "syllabus"
RESOURCE_TAB_DIR = BASE_DIR / "data" / "resource_tab"
RESOURCE_TAB_DIR.mkdir(parents=True, exist_ok=True)
INDEX_PATH = RESOURCE_TAB_DIR / "index.json"

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

_STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "if", "of", "to", "in", "on", "for",
    "with", "as", "is", "was", "were", "are", "be", "been", "being", "it",
    "its", "this", "that", "these", "those", "at", "by", "from", "into",
    "grade", "web", "simple", "english",
}


def _extract_text(filename: str, contents: bytes, ext: str) -> str:
    if ext == ".txt":
        return contents.decode("utf-8", errors="ignore")
    if ext == ".pdf":
        try:
            reader = PdfReader(BytesIO(contents))
            return "".join(page.extract_text() or "" for page in reader.pages)
        except Exception:
            return ""
    if ext == ".docx":
        try:
            document = Document(BytesIO(contents))
            return "\n".join(p.text for p in document.paragraphs)
        except Exception:
            return ""
    return ""


def _keywords(text: str) -> set:
    return {w for w in re.findall(r"[a-zA-Z']+", text.lower()) if len(w) > 2 and w not in _STOPWORDS}


def _topic_entries():
    """Yield (grade, subject, topic_title) for every topic-style resource
    title across every available grade syllabus, e.g.
    'Science (Grade 6): Cells' -> (6, 'Science', 'Cells')."""
    for path in sorted(SYLLABUS_DIR.glob("grade*.json")):
        try:
            grade = int(re.match(r"grade(\d+)", path.stem).group(1))
        except (AttributeError, ValueError):
            continue
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
        for subject_name, subject in data.get("subjects", {}).items():
            for key, items in subject.items():
                if not isinstance(items, list):
                    continue
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    title = item.get("title", "")
                    match = re.match(rf"^{re.escape(subject_name)} \(Grade {grade}\): (.+)$", title)
                    if match:
                        topic = match.group(1)
                        topic = re.sub(r"\s*\((Simple English|Web)\)$", "", topic)
                        yield grade, subject_name, topic


def match_topics(text: str, limit: int = 8) -> list:
    """Find syllabus topics whose words overlap most with the document's
    text. Pure local keyword overlap - no external calls, no fabrication."""
    doc_words = _keywords(text)
    if not doc_words:
        return []
    scored = {}
    for grade, subject, topic in _topic_entries():
        topic_words = _keywords(topic)
        if not topic_words:
            continue
        overlap = len(doc_words & topic_words)
        if overlap == 0:
            continue
        key = (grade, subject, topic)
        scored[key] = max(scored.get(key, 0), overlap)
    ranked = sorted(scored.items(), key=lambda kv: kv[1], reverse=True)[:limit]
    return [
        {"grade": grade, "subject": subject, "topic": topic, "score": score}
        for (grade, subject, topic), score in ranked
    ]


def _load_index() -> list:
    if not INDEX_PATH.exists():
        return []
    with open(INDEX_PATH, encoding="utf-8") as f:
        return json.load(f)


def _save_index(records: list) -> None:
    with open(INDEX_PATH, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2, ensure_ascii=False)


def list_documents() -> list:
    return _load_index()


def get_document(doc_id: str) -> dict | None:
    for record in _load_index():
        if record["id"] == doc_id:
            return record
    return None


def get_document_path(doc_id: str) -> Path | None:
    record = get_document(doc_id)
    if not record:
        return None
    return RESOURCE_TAB_DIR / record["stored_filename"]


def add_document(filename: str, contents: bytes) -> dict:
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type '{ext}'. Allowed: {sorted(ALLOWED_EXTENSIONS)}")

    text = _extract_text(filename, contents, ext)
    summary = summarize(text) if text else ""
    matched_topics = match_topics(text) if text else []

    doc_id = uuid.uuid4().hex[:12]
    stored_filename = f"{doc_id}{ext}"
    with open(RESOURCE_TAB_DIR / stored_filename, "wb") as f:
        f.write(contents)

    record = {
        "id": doc_id,
        "filename": filename,
        "stored_filename": stored_filename,
        "type": ext.lstrip("."),
        "summary": summary,
        "matched_topics": matched_topics,
    }

    records = _load_index()
    records.append(record)
    _save_index(records)
    return record


def delete_document(doc_id: str) -> bool:
    records = _load_index()
    record = next((r for r in records if r["id"] == doc_id), None)
    if not record:
        return False
    path = RESOURCE_TAB_DIR / record["stored_filename"]
    if path.exists():
        path.unlink()
    records = [r for r in records if r["id"] != doc_id]
    _save_index(records)
    return True
