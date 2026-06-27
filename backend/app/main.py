import json
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pypdf import PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

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


def _progress_csv(child: str, progress: dict) -> str:
    lines = ["subject,score"]
    for subject, score in progress.get("scores", {}).items():
        lines.append(f"{subject},{score}")
    lines.append("")
    lines.append(f"badges,{';'.join(progress.get('badges', []))}")
    return "\n".join(lines)


def _progress_pdf(child: str, progress: dict) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 72
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(72, y, f"{child}'s Progress Report")
    y -= 30
    pdf.setFont("Helvetica", 12)
    for subject, score in progress.get("scores", {}).items():
        pdf.drawString(72, y, f"{subject}: {score}")
        y -= 18
    y -= 12
    pdf.drawString(72, y, f"Badges: {', '.join(progress.get('badges', [])) or 'None yet'}")
    pdf.showPage()
    pdf.save()
    return buffer.getvalue()


@app.get("/api/progress/{child}/export")
def export_progress(child: str, format: str = "csv"):
    _require_child(child)
    progress = get_progress(child)
    if format == "csv":
        return StreamingResponse(
            BytesIO(_progress_csv(child, progress).encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{child}-progress.csv"'},
        )
    if format == "pdf":
        return StreamingResponse(
            BytesIO(_progress_pdf(child, progress)),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{child}-progress.pdf"'},
        )
    raise HTTPException(status_code=422, detail="format must be 'csv' or 'pdf'")


@app.get("/api/grade/{standard}/export")
def export_syllabus(standard: int, format: str = "json"):
    path = SYLLABUS_DIR / f"grade{standard}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Grade {standard} not available yet")
    with open(path) as f:
        data = json.load(f)
    data = _sanitize_json(data)

    if format == "json":
        return StreamingResponse(
            BytesIO(json.dumps(data, indent=2).encode("utf-8")),
            media_type="application/json",
            headers={"Content-Disposition": f'attachment; filename="grade{standard}-syllabus.json"'},
        )
    if format == "csv":
        lines = ["subject,resource_type,title,url"]
        for subject, content in data.get("subjects", {}).items():
            for resource_type, items in content.items():
                if not isinstance(items, list):
                    continue
                for item in items:
                    if not isinstance(item, dict):
                        continue
                    title = item.get("title", "")
                    url = item.get("url") or item.get("link", "")
                    lines.append(f'"{subject}","{resource_type}","{title}","{url}"')
        return StreamingResponse(
            BytesIO("\n".join(lines).encode("utf-8")),
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="grade{standard}-syllabus.csv"'},
        )
    raise HTTPException(status_code=422, detail="format must be 'json' or 'csv'")


@app.post("/api/exam-result/export")
def export_exam_result(payload: dict):
    try:
        child = payload["child"]
        subject = payload["subject"]
        score = payload["score"]
        passed = payload["passed"]
        answers = payload.get("answers", [])
    except KeyError as exc:
        raise HTTPException(status_code=422, detail="child, subject, score, and passed are required") from exc

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 72
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(72, y, f"{child}'s Exam Result: {subject}")
    y -= 30
    pdf.setFont("Helvetica", 12)
    pdf.drawString(72, y, f"Score: {score}% ({'Passed' if passed else 'Not yet passed'})")
    y -= 24
    for i, answer in enumerate(answers, start=1):
        question = str(answer.get("question", ""))[:90]
        given = str(answer.get("given", ""))[:60]
        pdf.drawString(72, y, f"{i}. {question}")
        y -= 16
        pdf.drawString(90, y, f"Answer: {given}")
        y -= 20
        if y < 72:
            pdf.showPage()
            y = height - 72
    pdf.showPage()
    pdf.save()

    return StreamingResponse(
        BytesIO(buffer.getvalue()),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{child}-{subject}-exam-result.pdf"'},
    )


ALLOWED_UPLOAD_EXTENSIONS = {".pdf", ".txt", ".png", ".jpg", ".jpeg", ".mp3", ".wav"}


@app.post("/api/upload-safe-book")
async def upload_safe_book(file: UploadFile = File(...)):
    filename = file.filename or ""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {sorted(ALLOWED_UPLOAD_EXTENSIONS)}",
        )
    if not safety_filter.is_safe(filename):
        raise HTTPException(status_code=400, detail="Upload rejected: unsafe content detected")

    contents = await file.read()
    text_sample = ""
    if ext == ".txt":
        text_sample = contents[:5000].decode("utf-8", errors="ignore")
    elif ext == ".pdf":
        try:
            reader = PdfReader(BytesIO(contents))
            text_sample = "".join(page.extract_text() or "" for page in reader.pages[:3])[:5000]
        except Exception:
            text_sample = ""

    if text_sample and not safety_filter.is_safe(text_sample):
        raise HTTPException(status_code=400, detail="Upload rejected: unsafe content detected")

    return {"filename": filename, "status": "accepted", "type": ext.lstrip(".")}


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


RESOURCE_KEYS = (
    "books",
    "video_resources",
    "text_resources",
    "cartoon_videos",
    "infographics",
    "textbooks",
    "audio_resources",
    "comics",
    "drawing_activities",
    "info_cards",
)


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
