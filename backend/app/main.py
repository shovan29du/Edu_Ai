import json
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pypdf import PdfReader
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from docx import Document

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
from app.summarize import summarize

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


def _filtered_subjects(data: dict, subjects: list, resource_types: list) -> dict:
    all_subjects = data.get("subjects", {})
    chosen_subjects = subjects or list(all_subjects.keys())
    result = {}
    for subject_name in chosen_subjects:
        content = all_subjects.get(subject_name)
        if not content:
            continue
        chosen_types = resource_types or list(content.keys())
        result[subject_name] = {k: content[k] for k in chosen_types if k in content}
    return result


def _custom_docx(standard: int, filtered: dict) -> bytes:
    doc = Document()
    doc.add_heading(f"Grade {standard} Syllabus", level=1)
    for subject_name, content in filtered.items():
        doc.add_heading(subject_name, level=2)
        for resource_type, items in content.items():
            if not isinstance(items, list) or not items:
                continue
            doc.add_heading(resource_type.replace("_", " ").title(), level=3)
            for item in items:
                if not isinstance(item, dict):
                    continue
                title = item.get("title", "")
                url = item.get("link") or item.get("url", "")
                fact = item.get("fact", "")
                line = title
                if url:
                    line += f" — {url}"
                if fact:
                    line += f": {fact}"
                doc.add_paragraph(line, style="List Bullet")
    buffer = BytesIO()
    doc.save(buffer)
    return buffer.getvalue()


def _custom_pdf(standard: int, filtered: dict) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 72

    def new_page():
        nonlocal y
        pdf.showPage()
        y = height - 72

    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(72, y, f"Grade {standard} Syllabus")
    y -= 30
    for subject_name, content in filtered.items():
        if y < 100:
            new_page()
        pdf.setFont("Helvetica-Bold", 13)
        pdf.drawString(72, y, subject_name)
        y -= 20
        for resource_type, items in content.items():
            if not isinstance(items, list) or not items:
                continue
            if y < 100:
                new_page()
            pdf.setFont("Helvetica-Oblique", 11)
            pdf.drawString(90, y, resource_type.replace("_", " ").title())
            y -= 16
            pdf.setFont("Helvetica", 10)
            for item in items:
                if not isinstance(item, dict):
                    continue
                title = str(item.get("title", ""))[:90]
                if y < 80:
                    new_page()
                pdf.drawString(108, y, f"- {title}")
                y -= 14
        y -= 8
    pdf.showPage()
    pdf.save()
    return buffer.getvalue()


@app.post("/api/grade/{standard}/export/custom")
def export_syllabus_custom(standard: int, payload: dict):
    path = SYLLABUS_DIR / f"grade{standard}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Grade {standard} not available yet")
    with open(path) as f:
        data = json.load(f)
    data = _sanitize_json(data)

    subjects = payload.get("subjects") or []
    resource_types = payload.get("resource_types") or []
    format_ = payload.get("format", "pdf")

    filtered = _filtered_subjects(data, subjects, resource_types)

    if format_ == "pdf":
        return StreamingResponse(
            BytesIO(_custom_pdf(standard, filtered)),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="grade{standard}-custom.pdf"'},
        )
    if format_ == "docx":
        return StreamingResponse(
            BytesIO(_custom_docx(standard, filtered)),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f'attachment; filename="grade{standard}-custom.docx"'},
        )
    raise HTTPException(status_code=422, detail="format must be 'pdf' or 'docx'")


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
async def upload_safe_book(
    file: UploadFile = File(...),
    standard: int | None = Form(None),
    subject: str | None = Form(None),
):
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
    full_text = ""
    if ext == ".txt":
        full_text = contents.decode("utf-8", errors="ignore")
    elif ext == ".pdf":
        try:
            reader = PdfReader(BytesIO(contents))
            full_text = "".join(page.extract_text() or "" for page in reader.pages)
        except Exception:
            full_text = ""

    text_sample = full_text[:5000]
    if text_sample and not safety_filter.is_safe(text_sample):
        raise HTTPException(status_code=400, detail="Upload rejected: unsafe content detected")

    summary = summarize(full_text) if full_text else ""
    if summary and not safety_filter.is_safe(summary):
        raise HTTPException(status_code=400, detail="Upload rejected: unsafe content detected")

    result = {"filename": filename, "status": "accepted", "type": ext.lstrip("."), "summary": summary}

    if standard is not None and subject:
        if not summary:
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from this file to summarize and add it.",
            )
        try:
            saved = curate_resource(
                standard,
                subject,
                "text_resources",
                {"title": Path(filename).stem, "description": summary},
            )
        except CurationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        result["added_resource"] = saved

    return result


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


@app.get("/api/sing-along-songs")
def sing_along_songs():
    with open(SAFE_DIR / "sing_along_songs.json") as f:
        data = json.load(f)
    return [s for s in data["songs"] if s.get("safe")]


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
