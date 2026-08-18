import json
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
SYLLABUS_DIR = BASE_DIR / "syllabus"
DB_PATH = DATA_DIR / "content_store.sqlite3"


def _connect():
    DATA_DIR.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS content_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            source_file TEXT NOT NULL,
            json_path TEXT NOT NULL,
            item_type TEXT NOT NULL,
            title TEXT,
            safe INTEGER,
            url TEXT
        )
        """
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_content_title ON content_items(title)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_content_source ON content_items(source_file)")
    conn.execute("CREATE INDEX IF NOT EXISTS idx_content_safe ON content_items(safe)")
    return conn


def _candidate_files():
    yield from sorted(SYLLABUS_DIR.glob("grade*.json"))
    for path in sorted(DATA_DIR.rglob("*.json")):
        if path.name.startswith(("progress_", "activity_", "attendance_")):
            continue
        if path.name in {"users.json", "link_audit_status.json"}:
            continue
        yield path


def _walk(obj, parts, source_file):
    if isinstance(obj, dict):
        title = obj.get("title") or obj.get("name") or obj.get("label")
        url = obj.get("url") or obj.get("link") or obj.get("resource_link") or obj.get("video_link")
        if title or url:
            yield {
                "source_file": source_file,
                "json_path": ".".join(parts) or "$",
                "item_type": parts[-1] if parts else "root",
                "title": str(title or "")[:300],
                "safe": None if "safe" not in obj else int(bool(obj.get("safe"))),
                "url": str(url or "")[:1000],
            }
        for key, value in obj.items():
            yield from _walk(value, parts + [str(key)], source_file)
    elif isinstance(obj, list):
        for index, value in enumerate(obj):
            yield from _walk(value, parts + [str(index)], source_file)


def reindex() -> dict:
    conn = _connect()
    try:
        conn.execute("DELETE FROM content_items")
        inserted = 0
        files = 0
        for path in _candidate_files():
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
            except Exception:
                continue
            files += 1
            try:
                rel = str(path.relative_to(BASE_DIR))
            except ValueError:
                rel = str(path)
            rows = list(_walk(data, [], rel))
            conn.executemany(
                """
                INSERT INTO content_items
                    (source_file, json_path, item_type, title, safe, url)
                VALUES
                    (:source_file, :json_path, :item_type, :title, :safe, :url)
                """,
                rows,
            )
            inserted += len(rows)
        conn.commit()
        return {"files_indexed": files, "items_indexed": inserted, "database": str(DB_PATH)}
    finally:
        conn.close()


def search(query: str, limit: int = 50) -> dict:
    conn = _connect()
    try:
        rows = conn.execute(
            """
            SELECT source_file, json_path, item_type, title, safe, url
            FROM content_items
            WHERE title LIKE ?
            ORDER BY title
            LIMIT ?
            """,
            (f"%{query}%", max(1, min(limit, 200))),
        ).fetchall()
        items = [
            {
                "source_file": source,
                "json_path": path,
                "item_type": item_type,
                "title": title,
                "safe": None if safe is None else bool(safe),
                "url": url,
            }
            for source, path, item_type, title, safe, url in rows
        ]
        return {"total": len(items), "items": items}
    finally:
        conn.close()
