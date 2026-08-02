"""Path-based local media library and owned-textbook topic analysis.

Files remain in their original folders.  The SQLite database contains only
paths, metadata, summaries, and topic associations.  Text analysis uses a
transparent local TF-IDF-style NLP relevance score and never uploads content.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import re
import sqlite3
import zipfile
from collections import Counter
from functools import lru_cache
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree

from docx import Document
from pypdf import PdfReader

from app.levels import LEVELS, syllabus_filename
from app.summarize import summarize

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "local_library.sqlite3"

CATEGORY_EXTENSIONS = {
    "books": {
        ".pdf", ".docx", ".txt", ".md", ".rtf", ".html", ".htm",
        ".epub", ".mobi", ".azw", ".azw3", ".kfx", ".fb2", ".odt",
        ".djvu", ".cbz", ".cbr",
    },
    "videos": {".mp4", ".m4v", ".mov", ".avi", ".mkv", ".webm"},
    "audio": {".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"},
    "pictures": {".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp", ".svg"},
}
ALL_EXTENSIONS = set().union(*CATEGORY_EXTENSIONS.values())
TEXT_EXTENSIONS = CATEGORY_EXTENSIONS["books"]
MAX_TEXT_CHARS = 2_000_000

STOPWORDS = {
    "the", "and", "for", "that", "with", "from", "this", "into", "are", "was",
    "were", "have", "has", "had", "not", "but", "you", "your", "their", "they",
    "its", "can", "will", "would", "about", "than", "then", "also", "each",
    "chapter", "section", "course", "lesson", "introduction", "using",
}


def _connect():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS local_files (
            id TEXT PRIMARY KEY,
            path TEXT NOT NULL UNIQUE,
            root_path TEXT NOT NULL,
            filename TEXT NOT NULL,
            category TEXT NOT NULL,
            extension TEXT NOT NULL,
            size INTEGER NOT NULL,
            modified REAL NOT NULL,
            summary TEXT,
            extracted_chars INTEGER NOT NULL DEFAULT 0,
            matched_topics TEXT NOT NULL DEFAULT '[]'
        )
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_local_category ON local_files(category)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_local_filename ON local_files(filename)")
    return conn


def _category(path: Path) -> str | None:
    ext = path.suffix.lower()
    return next((name for name, extensions in CATEGORY_EXTENSIONS.items() if ext in extensions), None)


def _tokens(text: str) -> Counter:
    words = (
        word.lower()
        for word in re.findall(r"[A-Za-z][A-Za-z0-9+#.-]{2,}", text)
    )
    return Counter(word for word in words if word not in STOPWORDS)


def _strip_xml(data: bytes) -> str:
    try:
        root = ElementTree.fromstring(data)
        return " ".join(part.strip() for part in root.itertext() if part.strip())
    except ElementTree.ParseError:
        return re.sub(r"<[^>]+>", " ", data.decode("utf-8", errors="ignore"))


def extract_text(path: Path) -> str:
    ext = path.suffix.lower()
    try:
        if ext in {".txt", ".md", ".rtf"}:
            text = path.read_text(encoding="utf-8", errors="ignore")
            if ext == ".rtf":
                text = re.sub(r"\\[a-z]+-?\d* ?|[{}]", " ", text)
        elif ext == ".pdf":
            with path.open("rb") as handle:
                text = "\n".join(page.extract_text() or "" for page in PdfReader(handle).pages)
        elif ext == ".docx":
            document = Document(path)
            text = "\n".join(paragraph.text for paragraph in document.paragraphs)
        elif ext in {".epub", ".odt"}:
            pieces = []
            with zipfile.ZipFile(path) as archive:
                for name in archive.namelist():
                    if name.lower().endswith((".xhtml", ".html", ".htm", "content.xml")):
                        pieces.append(_strip_xml(archive.read(name)))
            text = "\n".join(pieces)
        elif ext in {".html", ".htm", ".fb2"}:
            text = _strip_xml(path.read_bytes())
        else:
            text = ""
    except (OSError, ValueError, zipfile.BadZipFile):
        text = ""
    return text[:MAX_TEXT_CHARS]


@lru_cache(maxsize=1)
def topic_catalogue() -> list[dict]:
    topics = []
    for level_id in LEVELS:
        path = BASE_DIR / "syllabus" / syllabus_filename(level_id)
        if not path.exists():
            continue
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        for subject_name, subject in data.get("subjects", {}).items():
            seen = set()
            candidates = [subject_name]
            if isinstance(subject, dict):
                for value in subject.values():
                    if not isinstance(value, list):
                        continue
                    for item in value[:300]:
                        if isinstance(item, dict):
                            title = item.get("title") or item.get("name") or item.get("topic")
                            if title:
                                candidates.append(str(title))
                        elif isinstance(item, str):
                            candidates.append(item)
            for title in candidates:
                clean = re.sub(r"\s+", " ", title).strip()
                key = clean.lower()
                if len(clean) < 3 or key in seen:
                    continue
                seen.add(key)
                topics.append({
                    "level": level_id,
                    "subject": subject_name,
                    "topic": clean[:300],
                    "tokens": _tokens(f"{subject_name} {clean}"),
                })
    return topics


def analyse_text(text: str, limit: int = 12) -> dict:
    doc = _tokens(text)
    if not doc:
        return {"summary": "", "matched_topics": [], "extracted_chars": len(text)}
    candidates = topic_catalogue()
    document_frequency = Counter()
    for item in candidates:
        document_frequency.update(item["tokens"].keys())
    total = max(len(candidates), 1)
    scored = []
    for item in candidates:
        overlap = set(doc) & set(item["tokens"])
        if not overlap:
            continue
        score = sum(
            (1 + math.log1p(doc[word])) * math.log((total + 1) / (document_frequency[word] + 1))
            for word in overlap
        )
        score /= math.sqrt(max(sum(item["tokens"].values()), 1))
        scored.append((score, item))
    scored.sort(key=lambda pair: pair[0], reverse=True)
    matches = [
        {
            "level": item["level"],
            "subject": item["subject"],
            "topic": item["topic"],
            "score": round(score, 3),
        }
        for score, item in scored[:limit]
    ]
    return {
        "summary": summarize(text) if text else "",
        "matched_topics": matches,
        "extracted_chars": len(text),
    }


def _file_id(path: Path) -> str:
    return hashlib.sha256(str(path).encode("utf-8")).hexdigest()[:24]


def normalize_folder(folder: str) -> Path:
    """Accept paths pasted from Windows Explorer and return a real directory."""
    value = os.path.expandvars(str(folder or "").strip())
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {'"', "'"}:
        value = value[1:-1].strip()
    if not value:
        raise ValueError("Choose a folder before starting the scan")
    try:
        root = Path(value).expanduser().resolve(strict=True)
    except (OSError, RuntimeError) as exc:
        raise ValueError(f"Folder does not exist or cannot be resolved: {value}") from exc
    if not root.is_dir():
        raise ValueError("The selected path is a file; choose its containing folder")
    try:
        with os.scandir(root) as entries:
            next(entries, None)
    except PermissionError as exc:
        raise PermissionError(str(root)) from exc
    except OSError as exc:
        raise ValueError(f"Folder cannot be read: {root}") from exc
    return root


def scan_folder(folder: str, analyse_books: bool = True, max_files: int = 2000) -> dict:
    root = normalize_folder(folder)
    max_files = max(1, min(max_files, 20_000))
    indexed = 0
    analysed = 0
    skipped = 0
    truncated = False
    warnings: list[str] = []
    conn = _connect()
    try:
        # A rescan is a fresh snapshot for this root. The surrounding SQLite
        # transaction preserves the previous snapshot if an unexpected error
        # aborts the scan.
        conn.execute("DELETE FROM local_files WHERE root_path = ?", (str(root),))

        def record_walk_error(error: OSError) -> None:
            nonlocal skipped
            skipped += 1
            if len(warnings) < 10:
                warnings.append(f"Skipped unreadable location: {error.filename or error}")

        stop = False
        for directory, directory_names, filenames in os.walk(
            root, topdown=True, onerror=record_walk_error, followlinks=False
        ):
            directory_path = Path(directory)
            directory_names[:] = [
                name for name in directory_names
                if not (directory_path / name).is_symlink()
            ]
            for filename in filenames:
                if indexed >= max_files:
                    truncated = True
                    stop = True
                    break
                path = directory_path / filename
                if path.suffix.lower() not in ALL_EXTENSIONS:
                    continue
                try:
                    if not path.is_file() or path.is_symlink():
                        continue
                    resolved = path.resolve(strict=True)
                    if root != resolved.parent and root not in resolved.parents:
                        skipped += 1
                        continue
                    stat = resolved.stat()
                    category = _category(resolved)
                    analysis = {"summary": "", "matched_topics": [], "extracted_chars": 0}
                    if analyse_books and resolved.suffix.lower() in TEXT_EXTENSIONS:
                        analysis = analyse_text(extract_text(resolved))
                        analysed += 1
                    conn.execute(
                        """
                        INSERT INTO local_files
                            (id, path, root_path, filename, category, extension, size, modified,
                             summary, extracted_chars, matched_topics)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ON CONFLICT(path) DO UPDATE SET
                            root_path=excluded.root_path, filename=excluded.filename,
                            category=excluded.category, extension=excluded.extension,
                            size=excluded.size, modified=excluded.modified,
                            summary=excluded.summary, extracted_chars=excluded.extracted_chars,
                            matched_topics=excluded.matched_topics
                        """,
                        (
                            _file_id(resolved), str(resolved), str(root), resolved.name, category,
                            resolved.suffix.lower(), stat.st_size, stat.st_mtime,
                            analysis["summary"], analysis["extracted_chars"],
                            json.dumps(analysis["matched_topics"], ensure_ascii=False),
                        ),
                    )
                    indexed += 1
                except (OSError, ValueError, sqlite3.Error) as exc:
                    skipped += 1
                    if len(warnings) < 10:
                        warnings.append(f"Skipped {path.name}: {exc}")
            if stop:
                break
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
    return {
        "root": str(root),
        "indexed": indexed,
        "books_analysed": analysed,
        "skipped": skipped,
        "truncated": truncated,
        "warnings": warnings,
        "files": list_files(root_path=str(root), limit=max_files),
    }


def list_files(category: str = "", query: str = "", root_path: str = "", limit: int = 500) -> list[dict]:
    clauses = []
    values = []
    if category:
        clauses.append("category = ?")
        values.append(category)
    if query:
        clauses.append("filename LIKE ?")
        values.append(f"%{query}%")
    if root_path:
        clauses.append("root_path = ?")
        values.append(root_path)
    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    values.append(max(1, min(limit, 5000)))
    conn = _connect()
    try:
        rows = conn.execute(
            f"SELECT * FROM local_files {where} ORDER BY category, filename LIMIT ?",
            values,
        ).fetchall()
        return [
            {
                **dict(row),
                "matched_topics": json.loads(row["matched_topics"] or "[]"),
                "open_url": f"/api/local-library/files/{row['id']}",
            }
            for row in rows
        ]
    finally:
        conn.close()


def get_file(file_id: str) -> tuple[dict, Path] | None:
    conn = _connect()
    try:
        row = conn.execute("SELECT * FROM local_files WHERE id = ?", (file_id,)).fetchone()
    finally:
        conn.close()
    if not row:
        return None
    record = dict(row)
    path = Path(record["path"])
    if not path.exists() or not path.is_file() or path.is_symlink():
        return None
    root = Path(record["root_path"])
    resolved = path.resolve()
    if root != resolved.parent and root not in resolved.parents:
        return None
    return record, resolved
