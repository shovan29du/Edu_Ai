import os

import pytest
from fastapi.testclient import TestClient

from app.main import app, SYLLABUS_DIR
from app.safety import safety_filter

client = TestClient(app)


def test_get_grade_returns_subjects():
    resp = client.get("/api/grade/1")
    assert resp.status_code == 200
    body = resp.json()
    assert "subjects" in body
    assert "Math" in body["subjects"]


def test_get_grade_not_found():
    resp = client.get("/api/grade/99")
    assert resp.status_code == 404


def test_progress_save_and_load_aliza():
    update = {"scores": {"Math": 90}, "badges": ["math-star"]}
    resp = client.post("/api/progress/Aliza", json=update)
    assert resp.status_code == 200

    resp = client.get("/api/progress/Aliza")
    assert resp.status_code == 200
    body = resp.json()
    assert body["scores"]["Math"] == 90
    assert "math-star" in body["badges"]


def test_progress_save_and_load_saifan():
    update = {"scores": {"English": 75}}
    client.post("/api/progress/Saifan", json=update)
    resp = client.get("/api/progress/Saifan")
    assert resp.json()["scores"]["English"] == 75


def test_progress_unknown_child_rejected():
    resp = client.get("/api/progress/Unknown")
    assert resp.status_code == 404


def test_safety_filter_blocks_bad_word():
    assert safety_filter.is_safe("This is a kind story") is True
    assert safety_filter.is_safe("This story has hate in it") is False
    sanitized = safety_filter.sanitize("I hate this")
    assert "hate" not in sanitized.lower()


def test_safe_music_only_returns_safe_songs():
    resp = client.get("/api/safe-music")
    assert resp.status_code == 200
    songs = resp.json()
    assert len(songs) > 0
    assert all(s.get("safe") for s in songs) if isinstance(songs[0], dict) else True


def test_grade2_available():
    resp = client.get("/api/grade/2")
    assert resp.status_code == 200
    assert "Math" in resp.json()["subjects"]


@pytest.mark.parametrize("standard", [3, 4, 5, 6, 7])
def test_grade3_and_grade4_available(standard):
    resp = client.get(f"/api/grade/{standard}")
    assert resp.status_code == 200
    assert "Math" in resp.json()["subjects"]
    assert "English" in resp.json()["subjects"]


@pytest.mark.parametrize("standard", [1, 2, 3, 4, 5, 6, 7])
def test_additional_subjects_available_every_grade(standard):
    resp = client.get(f"/api/grade/{standard}")
    assert resp.status_code == 200
    subjects = resp.json()["subjects"]
    for name in ("Science", "Geography", "World History", "Islamic Studies"):
        assert name in subjects


@pytest.mark.parametrize("standard", [1, 2, 3, 4, 5, 6, 7])
def test_world_literature_and_art_available_every_grade(standard):
    resp = client.get(f"/api/grade/{standard}")
    assert resp.status_code == 200
    subjects = resp.json()["subjects"]
    for name in ("World Literature", "Art"):
        assert name in subjects


@pytest.mark.parametrize("standard", [1, 2, 3, 4, 5, 6, 7])
def test_new_resource_type_keys_present_on_every_subject(standard):
    resp = client.get(f"/api/grade/{standard}")
    assert resp.status_code == 200
    subjects = resp.json()["subjects"]
    for subject in subjects.values():
        for key in ("textbooks", "audio_resources", "comics", "drawing_activities", "info_cards"):
            assert key in subject


def test_coding_starts_at_grade2():
    resp = client.get("/api/grade/1")
    assert "Coding" not in resp.json()["subjects"]

    resp = client.get("/api/grade/2")
    assert "Coding" in resp.json()["subjects"]


def test_grade7_available():
    resp = client.get("/api/grade/7")
    assert resp.status_code == 200
    subjects = resp.json()["subjects"]
    assert "Math" in subjects
    assert "Coding" in subjects


def test_search_returns_matching_safe_resources():
    resp = client.get("/api/search/1", params={"q": "phonics"})
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) >= 1
    assert all(r["safe"] for r in results)
    assert results[0]["subject"] == "English"


def test_search_empty_query_returns_empty_list():
    resp = client.get("/api/search/1", params={"q": ""})
    assert resp.status_code == 200
    assert resp.json() == []


def test_search_unknown_grade_404():
    resp = client.get("/api/search/99", params={"q": "math"})
    assert resp.status_code == 404


def test_profiles_includes_parent():
    resp = client.get("/api/profiles")
    assert resp.status_code == 200
    assert resp.json() == ["Aliza", "Saifan", "Parent"]


def test_web_search_returns_501_when_unconfigured(monkeypatch):
    monkeypatch.delenv("BRAVE_SEARCH_API_KEY", raising=False)
    resp = client.get("/api/web-search", params={"q": "math games"})
    assert resp.status_code == 501
    assert "BRAVE_SEARCH_API_KEY" in resp.json()["detail"]


def test_web_search_empty_query_returns_empty_list():
    resp = client.get("/api/web-search", params={"q": ""})
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.fixture
def temp_grade_path():
    path = SYLLABUS_DIR / "grade8.json"
    yield path
    if path.exists():
        os.remove(path)


def test_curate_resource_creates_grade_and_is_searchable(temp_grade_path):
    payload = {
        "standard": 8,
        "subject": "Science",
        "resource_type": "video_resources",
        "resource": {
            "title": "Intro to the Solar System",
            "url": "https://example.com/solar-system",
            "description": "A kid-friendly tour of the planets.",
        },
    }
    resp = client.post("/api/curate-resource", json=payload)
    assert resp.status_code == 200
    assert resp.json()["safe"] is True
    assert temp_grade_path.exists()

    resp = client.get("/api/grade/8")
    assert resp.status_code == 200
    body = resp.json()
    assert "Intro to the Solar System" in [
        v["title"] for v in body["subjects"]["Science"]["video_resources"]
    ]


def test_curate_resource_rejects_unsafe_content(temp_grade_path):
    payload = {
        "standard": 8,
        "subject": "Science",
        "resource_type": "video_resources",
        "resource": {
            "title": "A story full of hate",
            "url": "https://example.com/bad",
        },
    }
    resp = client.post("/api/curate-resource", json=payload)
    assert resp.status_code == 400


def test_curate_resource_rejects_bad_resource_type(temp_grade_path):
    payload = {
        "standard": 8,
        "subject": "Science",
        "resource_type": "not_a_real_type",
        "resource": {"title": "Whatever"},
    }
    resp = client.post("/api/curate-resource", json=payload)
    assert resp.status_code == 422
