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


def test_sing_along_songs_returns_lyrics():
    resp = client.get("/api/sing-along-songs")
    assert resp.status_code == 200
    songs = resp.json()
    assert len(songs) > 0
    assert all(s.get("safe") for s in songs)
    assert all(s.get("lyrics") for s in songs)


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


@pytest.mark.parametrize("standard", range(1, 11))
def test_social_studies_and_environmental_science_available_every_grade(standard):
    resp = client.get(f"/api/grade/{standard}")
    assert resp.status_code == 200
    subjects = resp.json()["subjects"]
    for name in ("Social Studies", "Environmental Science"):
        assert name in subjects


@pytest.mark.parametrize("standard", range(1, 11))
def test_physical_education_self_defense_available_every_grade(standard):
    resp = client.get(f"/api/grade/{standard}")
    assert resp.status_code == 200
    subjects = resp.json()["subjects"]
    assert "Physical Education & Self-Defense" in subjects


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


@pytest.mark.parametrize("standard", [1, 2, 3, 4, 5, 6, 7])
def test_music_and_general_knowledge_available_every_grade(standard):
    resp = client.get(f"/api/grade/{standard}")
    assert resp.status_code == 200
    subjects = resp.json()["subjects"]
    for name in ("Music", "General Knowledge"):
        assert name in subjects


def test_survival_skills_starts_at_grade3():
    resp = client.get("/api/grade/1")
    assert "Survival Skills" not in resp.json()["subjects"]

    resp = client.get("/api/grade/2")
    assert "Survival Skills" not in resp.json()["subjects"]

    resp = client.get("/api/grade/3")
    assert "Survival Skills" in resp.json()["subjects"]


def test_cooking_starts_at_grade3():
    resp = client.get("/api/grade/1")
    assert "Cooking" not in resp.json()["subjects"]

    resp = client.get("/api/grade/2")
    assert "Cooking" not in resp.json()["subjects"]

    resp = client.get("/api/grade/3")
    assert "Cooking" in resp.json()["subjects"]


def test_grade8_available_with_core_subjects():
    resp = client.get("/api/grade/8")
    assert resp.status_code == 200
    subjects = resp.json()["subjects"]
    for name in ["Math", "English", "Science", "Geography", "World History",
                 "Islamic Studies", "Coding", "World Literature", "Art",
                 "Music", "Survival Skills", "General Knowledge", "Cooking",
                 "Foreign Languages", "Social Studies", "Environmental Science",
                 "Physical Education & Self-Defense"]:
        assert name in subjects


def test_grade9_available_with_core_subjects():
    resp = client.get("/api/grade/9")
    assert resp.status_code == 200
    subjects = resp.json()["subjects"]
    for name in ["Math", "English", "Science", "Geography", "World History",
                 "Islamic Studies", "Coding", "World Literature", "Art",
                 "Music", "Survival Skills", "General Knowledge", "Cooking",
                 "Foreign Languages", "Social Studies", "Environmental Science",
                 "Physical Education & Self-Defense"]:
        assert name in subjects


def test_grade10_available_with_core_subjects():
    resp = client.get("/api/grade/10")
    assert resp.status_code == 200
    subjects = resp.json()["subjects"]
    for name in ["Math", "English", "Science", "Geography", "World History",
                 "Islamic Studies", "Coding", "World Literature", "Art",
                 "Music", "Survival Skills", "General Knowledge", "Cooking",
                 "Foreign Languages", "Social Studies", "Environmental Science",
                 "Physical Education & Self-Defense"]:
        assert name in subjects


def test_foreign_languages_starts_at_grade2():
    resp = client.get("/api/grade/1")
    assert "Foreign Languages" not in resp.json()["subjects"]

    resp = client.get("/api/grade/2")
    assert "Foreign Languages" in resp.json()["subjects"]
    audio = resp.json()["subjects"]["Foreign Languages"]["audio_resources"]
    assert len(audio) == 6
    assert all(a["safe"] for a in audio)


def test_general_knowledge_has_quotes_and_summaries_every_grade():
    for standard in range(1, 11):
        resp = client.get(f"/api/grade/{standard}")
        cards = resp.json()["subjects"]["General Knowledge"]["info_cards"]
        titles = [c["title"] for c in cards]
        assert "Philosophical Quote" in titles
        assert "Famous Quote" in titles
        assert any(t.startswith("Famous Person:") for t in titles)
        assert any(t.startswith("Book Summary:") for t in titles)


@pytest.mark.parametrize("standard", [1, 2, 3, 4, 5, 6, 7])
def test_art_history_present_every_grade(standard):
    resp = client.get(f"/api/grade/{standard}")
    assert resp.status_code == 200
    art = resp.json()["subjects"]["Art"]
    assert any("Art History" in (v.get("title") or "") for v in art["video_resources"])


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
    assert resp.json() == ["Aliza", "Saifan", "Bely", "Parent", "Shovan"]


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
    path = SYLLABUS_DIR / "grade11.json"
    yield path
    if path.exists():
        os.remove(path)


def test_curate_resource_creates_grade_and_is_searchable(temp_grade_path):
    payload = {
        "standard": 11,
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

    resp = client.get("/api/grade/11")
    assert resp.status_code == 200
    body = resp.json()
    assert "Intro to the Solar System" in [
        v["title"] for v in body["subjects"]["Science"]["video_resources"]
    ]


def test_curate_resource_rejects_unsafe_content(temp_grade_path):
    payload = {
        "standard": 11,
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
        "standard": 11,
        "subject": "Science",
        "resource_type": "not_a_real_type",
        "resource": {"title": "Whatever"},
    }
    resp = client.post("/api/curate-resource", json=payload)
    assert resp.status_code == 422


def test_export_progress_csv():
    client.post("/api/progress/Aliza", json={"scores": {"Math": 88}, "badges": ["star"]})
    resp = client.get("/api/progress/Aliza/export", params={"format": "csv"})
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/csv")
    assert "Math,88" in resp.text


def test_export_progress_pdf():
    client.post("/api/progress/Aliza", json={"scores": {"Math": 88}, "badges": ["star"]})
    resp = client.get("/api/progress/Aliza/export", params={"format": "pdf"})
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content[:4] == b"%PDF"


def test_export_progress_invalid_format():
    resp = client.get("/api/progress/Aliza/export", params={"format": "xml"})
    assert resp.status_code == 422


def test_export_progress_unknown_child_404():
    resp = client.get("/api/progress/Unknown/export")
    assert resp.status_code == 404


def test_download_resource_txt():
    resp = client.post(
        "/api/resource/download",
        json={
            "title": "Plants for kids",
            "body": "Plants need sunlight, water, and soil to grow.",
            "url": "https://www.dogonews.com/",
            "source": "DOGOnews",
        },
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/plain")
    assert "Plants need sunlight" in resp.text
    assert "DOGOnews" in resp.text


def test_download_resource_docx():
    resp = client.post(
        "/api/resource/download",
        json={"title": "News article", "body": "Some real saved text.", "format": "docx"},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    assert resp.content[:2] == b"PK"


def test_download_resource_without_body_still_works():
    resp = client.post(
        "/api/resource/download",
        json={"title": "Source link only", "url": "https://www.timeforkids.com/"},
    )
    assert resp.status_code == 200
    assert "No saved article text" in resp.text


def test_download_resource_rejects_unsafe_text():
    resp = client.post(
        "/api/resource/download",
        json={"title": "kill everyone", "body": "fine"},
    )
    assert resp.status_code == 400


def test_export_syllabus_json():
    resp = client.get("/api/grade/1/export", params={"format": "json"})
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("application/json")
    assert "Math" in resp.json()["subjects"]


def test_export_syllabus_csv():
    resp = client.get("/api/grade/1/export", params={"format": "csv"})
    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/csv")
    assert resp.text.startswith("subject,resource_type,title,url")


def test_export_syllabus_invalid_format():
    resp = client.get("/api/grade/1/export", params={"format": "xml"})
    assert resp.status_code == 422


def test_export_syllabus_unknown_grade_404():
    resp = client.get("/api/grade/99/export")
    assert resp.status_code == 404


def test_export_exam_result_pdf():
    payload = {
        "child": "Aliza",
        "subject": "Math",
        "score": 90,
        "passed": True,
        "answers": [{"question": "2+2?", "given": "4"}],
    }
    resp = client.post("/api/exam-result/export", json=payload)
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content[:4] == b"%PDF"


def test_export_exam_result_missing_field_422():
    resp = client.post("/api/exam-result/export", json={"child": "Aliza"})
    assert resp.status_code == 422


def test_upload_rejects_unsupported_extension():
    resp = client.post(
        "/api/upload-safe-book",
        files={"file": ("malware.exe", b"binary", "application/octet-stream")},
    )
    assert resp.status_code == 400


def test_upload_accepts_image_file():
    resp = client.post(
        "/api/upload-safe-book",
        files={"file": ("photo.png", b"\x89PNG\r\n\x1a\n", "image/png")},
    )
    assert resp.status_code == 200
    assert resp.json()["type"] == "png"


def test_upload_accepts_audio_file():
    resp = client.post(
        "/api/upload-safe-book",
        files={"file": ("song.mp3", b"ID3", "audio/mpeg")},
    )
    assert resp.status_code == 200
    assert resp.json()["type"] == "mp3"


def test_upload_rejects_unsafe_text_content():
    resp = client.post(
        "/api/upload-safe-book",
        files={"file": ("story.txt", b"This story has hate in it", "text/plain")},
    )
    assert resp.status_code == 400


def test_upload_summarizes_text_file():
    long_text = " ".join(
        f"Sentence number {i} talks about whales and the ocean and migration patterns."
        for i in range(20)
    )
    resp = client.post(
        "/api/upload-safe-book",
        files={"file": ("whales.txt", long_text.encode(), "text/plain")},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["summary"]
    assert len(body["summary"]) < len(long_text)


def test_upload_and_add_to_syllabus(temp_grade_path):
    long_text = " ".join(
        f"Sentence number {i} talks about whales and the ocean and migration patterns."
        for i in range(20)
    )
    resp = client.post(
        "/api/upload-safe-book",
        files={"file": ("whales.txt", long_text.encode(), "text/plain")},
        data={"standard": "11", "subject": "Science"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["added_resource"]["safe"] is True
    assert temp_grade_path.exists()


def test_export_syllabus_custom_pdf():
    resp = client.post(
        "/api/grade/1/export/custom",
        json={"subjects": ["Math"], "resource_types": ["books"], "format": "pdf"},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "application/pdf"
    assert resp.content[:4] == b"%PDF"


def test_export_syllabus_custom_docx():
    resp = client.post(
        "/api/grade/1/export/custom",
        json={"subjects": ["Math"], "resource_types": ["books"], "format": "docx"},
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )


def test_export_syllabus_custom_defaults_to_all_subjects():
    resp = client.post("/api/grade/1/export/custom", json={"format": "pdf"})
    assert resp.status_code == 200


def test_export_syllabus_custom_invalid_format():
    resp = client.post("/api/grade/1/export/custom", json={"format": "xml"})
    assert resp.status_code == 422


def test_export_syllabus_custom_unknown_grade_404():
    resp = client.post("/api/grade/99/export/custom", json={"format": "pdf"})
    assert resp.status_code == 404


def test_lesson_streak_awards_badge_after_consecutive_days(monkeypatch):
    from app import storage
    from datetime import date, timedelta

    base = date(2024, 1, 1)
    monkeypatch.setattr(storage, "_today", lambda: base)
    client.post("/api/progress/Aliza", json={"completed_lessons": {"StreakTestSubject": ["learn"]}})

    monkeypatch.setattr(storage, "_today", lambda: base + timedelta(days=1))
    client.post("/api/progress/Aliza", json={"completed_lessons": {"StreakTestSubject": ["watch"]}})

    monkeypatch.setattr(storage, "_today", lambda: base + timedelta(days=2))
    resp = client.post("/api/progress/Aliza", json={"completed_lessons": {"StreakTestSubject": ["explore"]}})

    data = resp.json()
    assert data["lesson_streak"] == 3
    assert "lesson-streak-3" in data["badges"]


def test_progress_completed_lessons_tracked_and_deduped():
    client.post("/api/progress/Aliza", json={"completed_lessons": {"Math": ["learn"]}})
    client.post("/api/progress/Aliza", json={"completed_lessons": {"Math": ["learn", "watch"]}})
    resp = client.get("/api/progress/Aliza")
    assert resp.json()["completed_lessons"]["Math"] == ["learn", "watch"]
