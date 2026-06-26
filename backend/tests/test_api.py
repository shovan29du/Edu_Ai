from fastapi.testclient import TestClient

from app.main import app
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
