import json
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

from app.safety import safety_filter
from app.storage import (
    ALLOWED_CHILDREN,
    ALL_PROFILES,
    get_progress,
    save_progress,
    get_activity_log,
    append_activity,
)
from app.websearch import web_search, SearchNotConfigured
from app.curate import curate_resource, CurationError, RESOURCE_KEYS as CURATE_RESOURCE_KEYS

BASE_DIR = Path(__file__).resolve().parent.parent
SYLLABUS_DIR = BASE_DIR / "syllabus"
SAFE_DIR = BASE_DIR / "safe"

app = FastAPI(title="Global Education Platform API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _require_child(child: str) -> str:
    if child not in ALLOWED_CHILDREN:
        raise HTTPException(status_code=404, detail="Unknown child profile")
    return child


def _sanitize_json(obj):
    if isinstance(obj, dict):
        return {k: _sanitize_json(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_sanitize_json(v) for v in obj]
    if isinstance(obj, str):
        return safety_filter.sanitize(obj)
    return obj


@app.get("/api/grade/{standard}")
def get_grade(standard: int):
    path = SYLLABUS_DIR / f"grade{standard}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Grade {standard} not available yet")
    with open(path) as f:
        data = json.load(f)
    return _sanitize_json(data)


@app.get("/api/progress/{child}")
def read_progress(child: str):
    _require_child(child)
    return get_progress(child)


@app.post("/api/progress/{child}")
def update_progress(child: str, update: dict):
    _require_child(child)
    result = save_progress(child, update)
    append_activity(child, {"type": "progress_update", "data": update})
    return result


@app.post("/api/upload-safe-book")
async def upload_safe_book(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        text_sample = contents[:5000].decode("utf-8", errors="ignore")
    except Exception:
        text_sample = ""
    if not safety_filter.is_safe(text_sample) or not safety_filter.is_safe(file.filename):
        raise HTTPException(status_code=400, detail="Upload rejected: unsafe content detected")
    return {"filename": file.filename, "status": "accepted"}


@app.get("/api/safe-music")
def safe_music():
    with open(SAFE_DIR / "safe_songs.json") as f:
        data = json.load(f)
    songs = [s for s in data["songs"] if s.get("safe")]
    return songs


@app.get("/api/activity-log/{child}")
def activity_log(child: str):
    _require_child(child)
    return get_activity_log(child)


@app.get("/api/safe-channels")
def safe_channels():
    with open(SAFE_DIR / "safe_channels.json") as f:
        return json.load(f)


@app.get("/api/profiles")
def profiles():
    return list(ALL_PROFILES)


@app.get("/api/web-search")
def web_search_endpoint(q: str):
    query = q.strip()
    if not query:
        return []
    try:
        return web_search(query)
    except SearchNotConfigured as exc:
        raise HTTPException(status_code=501, detail=str(exc)) from exc


@app.post("/api/curate-resource")
def curate_resource_endpoint(payload: dict):
    try:
        standard = int(payload["standard"])
        subject = payload["subject"]
        resource_type = payload["resource_type"]
        resource = payload["resource"]
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=422, detail="standard, subject, resource_type, resource are required") from exc

    if resource_type not in CURATE_RESOURCE_KEYS:
        raise HTTPException(status_code=422, detail=f"resource_type must be one of {CURATE_RESOURCE_KEYS}")

    try:
        saved = curate_resource(standard, subject, resource_type, resource)
    except CurationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return saved


RESOURCE_KEYS = ("books", "video_resources", "text_resources", "cartoon_videos", "infographics")


@app.get("/api/search/{standard}")
def search_grade(standard: int, q: str):
    path = SYLLABUS_DIR / f"grade{standard}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Grade {standard} not available yet")
    with open(path) as f:
        data = json.load(f)

    query = q.strip().lower()
    if not query:
        return []

    results = []
    for subject_name, subject in data.get("subjects", {}).items():
        for key in RESOURCE_KEYS:
            for resource in subject.get(key, []):
                if resource.get("safe") is not True:
                    continue
                haystack = " ".join(
                    str(v) for v in (resource.get("title"), resource.get("description"))
                    if v
                ).lower()
                if query in haystack:
                    results.append(
                        _sanitize_json({**resource, "subject": subject_name, "resource_type": key})
                    )
    return results
