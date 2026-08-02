"""Painting Studio gallery ("My Art"): lets a child save a PNG snapshot of
their digital painting so it survives a reload, reopen it to keep working,
or delete it.

Images are written to disk as plain PNG files (not embedded as giant
base64 blobs inside JSON) with a small per-child JSON index of metadata,
mirroring the file-on-disk + index.json pattern already used by
app.resource_tab -- this keeps the per-child JSON files that app.storage
manages (progress_<child>.json etc.) small, and avoids inventing a new
storage mechanism.
"""

import base64
import json
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
PAINTINGS_DIR = DATA_DIR / "paintings"
PAINTINGS_DIR.mkdir(parents=True, exist_ok=True)

MAX_PER_CHILD = 30                  # oldest saved pieces are dropped beyond this
MAX_IMAGE_BYTES = 6 * 1024 * 1024   # 6MB safety cap per PNG


def _safe_child_dirname(child: str) -> str:
    # Defensive: keep filesystem paths confined to the paintings directory
    # even if a caller passes something unexpected.
    return re.sub(r"[^A-Za-z0-9_-]", "_", child) or "_"


def _child_dir(child: str) -> Path:
    d = PAINTINGS_DIR / _safe_child_dirname(child)
    d.mkdir(parents=True, exist_ok=True)
    return d


def _index_path(child: str) -> Path:
    return _child_dir(child) / "index.json"


def _load_index(child: str) -> list:
    path = _index_path(child)
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _save_index(child: str, records: list) -> None:
    with open(_index_path(child), "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)


def _decode_data_url(data_url: str) -> bytes:
    if not isinstance(data_url, str) or not data_url:
        raise ValueError("Missing image data")
    payload = data_url.split(",", 1)[1] if data_url.startswith("data:") and "," in data_url else data_url
    try:
        raw = base64.b64decode(payload, validate=False)
    except Exception as exc:
        raise ValueError("Invalid image data") from exc
    if not raw:
        raise ValueError("Invalid image data")
    if len(raw) > MAX_IMAGE_BYTES:
        raise ValueError("Image is too large to save")
    return raw


def list_paintings(child: str) -> list:
    """Metadata only (no pixel data) -- the gallery UI fetches each PNG via
    its own image endpoint."""
    return sorted(_load_index(child), key=lambda r: r["updated_at"], reverse=True)


def get_painting(child: str, painting_id: str) -> dict | None:
    for record in _load_index(child):
        if record["id"] == painting_id:
            return record
    return None


def get_painting_path(child: str, painting_id: str) -> Path | None:
    record = get_painting(child, painting_id)
    if not record:
        return None
    return _child_dir(child) / record["stored_filename"]


def save_painting(child: str, title: str, image_data_url: str, painting_id: str | None = None) -> dict:
    """Create a new saved painting, or overwrite an existing one (by id) so a
    child can reopen a piece and keep working on it."""
    raw = _decode_data_url(image_data_url)
    now = datetime.now(timezone.utc).isoformat()

    records = _load_index(child)
    existing = next((r for r in records if r["id"] == painting_id), None) if painting_id else None

    if existing:
        stored_filename = existing["stored_filename"]
        existing["title"] = title.strip() if title and title.strip() else existing.get("title", "Untitled")
        existing["updated_at"] = now
        record = existing
    else:
        new_id = uuid.uuid4().hex[:12]
        stored_filename = f"{new_id}.png"
        record = {
            "id": new_id,
            "title": title.strip() if title and title.strip() else "Untitled",
            "stored_filename": stored_filename,
            "created_at": now,
            "updated_at": now,
        }
        records.append(record)

    with open(_child_dir(child) / stored_filename, "wb") as f:
        f.write(raw)

    # Cap gallery size so a forgetful child can't fill the disk: drop the
    # oldest pieces beyond MAX_PER_CHILD.
    records.sort(key=lambda r: r["updated_at"])
    while len(records) > MAX_PER_CHILD:
        dropped = records.pop(0)
        dropped_path = _child_dir(child) / dropped["stored_filename"]
        if dropped_path.exists():
            dropped_path.unlink()

    _save_index(child, records)
    return record


def delete_painting(child: str, painting_id: str) -> bool:
    records = _load_index(child)
    record = next((r for r in records if r["id"] == painting_id), None)
    if not record:
        return False
    path = _child_dir(child) / record["stored_filename"]
    if path.exists():
        path.unlink()
    records = [r for r in records if r["id"] != painting_id]
    _save_index(child, records)
    return True
