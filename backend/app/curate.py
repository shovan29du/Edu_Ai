import json
from pathlib import Path
from threading import Lock

from app.safety import safety_filter

SYLLABUS_DIR = Path(__file__).resolve().parent.parent / "syllabus"
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
    "podcasts",
    "news_resources",
)

_lock = Lock()


class CurationError(ValueError):
    pass


def curate_resource(standard: int, subject: str, resource_type: str, resource: dict) -> dict:
    if resource_type not in RESOURCE_KEYS:
        raise CurationError(f"resource_type must be one of {RESOURCE_KEYS}")
    if not safety_filter.validate_resource(resource):
        raise CurationError("Resource rejected: contains blocked words")

    resource = {**resource, "safe": True}

    with _lock:
        path = SYLLABUS_DIR / f"grade{standard}.json"
        if path.exists():
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
        else:
            data = {"standard": standard, "subjects": {}}

        subject_data = data["subjects"].setdefault(
            subject,
            {key: [] for key in RESOURCE_KEYS} | {"quiz_bank": [], "exam": {"questions": [], "passing_score": 60}},
        )
        subject_data.setdefault(resource_type, []).append(resource)

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    return resource
