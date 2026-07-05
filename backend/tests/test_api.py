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


def test_resource_tab_rejects_unsupported_extension():
    resp = client.post(
        "/api/resource-tab/upload",
        files={"file": ("malware.exe", b"binary", "application/octet-stream")},
    )
    assert resp.status_code == 400


def test_resource_tab_rejects_unsafe_text_content():
    resp = client.post(
        "/api/resource-tab/upload",
        files={"file": ("story.txt", b"This story has hate in it", "text/plain")},
    )
    assert resp.status_code == 400


def test_resource_tab_upload_matches_topics_and_lists():
    text = "This document is all about Volcanoes and Plate tectonics and how the Earth's crust moves."
    resp = client.post(
        "/api/resource-tab/upload",
        files={"file": ("earth.txt", text.encode(), "text/plain")},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["filename"] == "earth.txt"
    assert body["type"] == "txt"
    topics = {m["topic"] for m in body["matched_topics"]}
    assert "Volcanoes" in topics or "Plate tectonics" in topics

    listed = client.get("/api/resource-tab")
    assert listed.status_code == 200
    assert any(d["id"] == body["id"] for d in listed.json())

    download = client.get(f"/api/resource-tab/{body['id']}/download")
    assert download.status_code == 200
    assert download.content == text.encode()

    deleted = client.delete(f"/api/resource-tab/{body['id']}")
    assert deleted.status_code == 200

    missing = client.get(f"/api/resource-tab/{body['id']}/download")
    assert missing.status_code == 404


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


def test_lesson_streak_awards_badge_after_consecutive_days(monkeypatch, tmp_path):
    from app import storage
    from datetime import date, timedelta

    monkeypatch.setattr(storage, "_progress_path", lambda child: tmp_path / f"progress_{child}.json")

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


# ──────────────────────────────────────────────────────────────────────────────
# Language Academy
# ──────────────────────────────────────────────────────────────────────────────

def test_languages_list():
    resp = client.get("/api/languages")
    assert resp.status_code == 200
    data = resp.json()
    assert "languages" in data
    assert len(data["languages"]) >= 10


def test_languages_list_has_required_fields():
    resp = client.get("/api/languages")
    lang = resp.json()["languages"][0]
    for field in ("code", "name", "flag", "greeting"):
        assert field in lang, f"Missing field: {field}"


def test_language_detail_french():
    resp = client.get("/api/languages/fr")
    assert resp.status_code == 200
    data = resp.json()
    assert data["code"] == "fr"
    assert "vocabulary" in data


def test_language_detail_arabic():
    resp = client.get("/api/languages/ar")
    assert resp.status_code == 200
    data = resp.json()
    assert data["code"] == "ar"
    assert data.get("direction") == "rtl"


def test_language_detail_not_found():
    resp = client.get("/api/languages/xx")
    assert resp.status_code == 404


def test_language_quiz():
    resp = client.get("/api/languages/fr/quiz")
    assert resp.status_code == 200
    data = resp.json()
    assert "quiz" in data
    assert len(data["quiz"]) > 0


@pytest.mark.parametrize("code", ["fr", "es", "ar", "de", "it", "ru", "zh", "ja", "ko"])
def test_all_language_vocab_files_loadable(code):
    resp = client.get(f"/api/languages/{code}")
    assert resp.status_code == 200
    assert resp.json()["code"] == code


# ──────────────────────────────────────────────────────────────────────────────
# Grammar Academy
# ──────────────────────────────────────────────────────────────────────────────

def test_grammar_curriculum_overview():
    resp = client.get("/api/grammar")
    assert resp.status_code == 200
    data = resp.json()
    assert "levels" in data
    assert "title" in data


def test_grammar_levels_all_present():
    resp = client.get("/api/grammar")
    levels = resp.json()["levels"]
    for level in ("beginner", "elementary", "intermediate", "advanced"):
        assert level in levels


def test_grammar_level_detail():
    resp = client.get("/api/grammar/beginner")
    assert resp.status_code == 200
    data = resp.json()
    assert "lessons" in data
    assert len(data["lessons"]) > 0


def test_grammar_level_lesson_has_quiz():
    resp = client.get("/api/grammar/beginner")
    lessons = resp.json()["lessons"]
    lesson_with_quiz = next((l for l in lessons if l.get("quiz")), None)
    assert lesson_with_quiz is not None


def test_grammar_level_not_found():
    resp = client.get("/api/grammar/nonexistent")
    assert resp.status_code == 404


# ──────────────────────────────────────────────────────────────────────────────
# Countries Explorer
# ──────────────────────────────────────────────────────────────────────────────

def test_countries_list():
    resp = client.get("/api/countries")
    assert resp.status_code == 200
    data = resp.json()
    assert "countries" in data
    assert data["total"] >= 100


def test_countries_list_has_required_fields():
    resp = client.get("/api/countries")
    country = resp.json()["countries"][0]
    for field in ("code", "name", "capital", "continent"):
        assert field in country


def test_country_detail_gb():
    resp = client.get("/api/countries/GB")
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "United Kingdom"


def test_country_detail_case_insensitive():
    resp = client.get("/api/countries/gb")
    assert resp.status_code == 200


def test_country_not_found():
    resp = client.get("/api/countries/ZZZ")
    assert resp.status_code == 404


# ──────────────────────────────────────────────────────────────────────────────
# Assessment Centre
# ──────────────────────────────────────────────────────────────────────────────

def test_assessment_age_groups():
    resp = client.get("/api/assessment/age-groups")
    assert resp.status_code == 200
    data = resp.json()
    assert "age_groups" in data
    assert len(data["age_groups"]) >= 4


def test_assessment_age_group_has_sections():
    resp = client.get("/api/assessment/age-groups")
    group_id = resp.json()["age_groups"][0]["id"]
    resp2 = client.get(f"/api/assessment/{group_id}")
    assert resp2.status_code == 200
    data = resp2.json()
    assert "sections" in data


def test_assessment_submit():
    resp = client.post("/api/assessment/Aliza/submit", json={
        "age_group": "7-9",
        "answers": {"0-0": 1, "0-1": 0},
        "score": 1,
        "total": 2,
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "score" in data
    assert "percentage" in data


def test_assessment_submit_unknown_child():
    resp = client.post("/api/assessment/Unknown/submit", json={"age_group": "7-9", "answers": {}})
    assert resp.status_code == 404


# ──────────────────────────────────────────────────────────────────────────────
# AI Tutor (offline — no API key)
# ──────────────────────────────────────────────────────────────────────────────

def test_ai_tutor_ask_returns_response():
    resp = client.post("/api/ai-tutor/ask", json={"question": "What is gravity?", "grade": 5, "subject": "Science"})
    assert resp.status_code == 200
    data = resp.json()
    assert "answer" in data
    assert isinstance(data["answer"], str)
    assert len(data["answer"]) > 0


def test_ai_tutor_explain_returns_response():
    resp = client.post("/api/ai-tutor/explain", json={"concept": "photosynthesis", "grade": 4, "subject": "Biology"})
    assert resp.status_code == 200
    assert "explanation" in resp.json()


def test_ai_tutor_flashcards_returns_list():
    resp = client.post("/api/ai-tutor/flashcards", json={"topic": "fractions", "grade": 5, "subject": "Math", "count": 4})
    assert resp.status_code == 200
    data = resp.json()
    assert "flashcards" in data
    assert isinstance(data["flashcards"], list)


def test_ai_tutor_quiz_returns_list():
    resp = client.post("/api/ai-tutor/quiz", json={"topic": "World War II", "grade": 8, "subject": "History", "count": 3})
    assert resp.status_code == 200
    data = resp.json()
    assert "quiz" in data
    assert isinstance(data["quiz"], list)


def test_ai_tutor_study_plan_returns_string():
    resp = client.post("/api/ai-tutor/study-plan", json={"subject": "Science", "grade": 6, "days": 5})
    assert resp.status_code == 200
    assert "plan" in resp.json()


# ──────────────────────────────────────────────────────────────────────────────
# Parent Dashboard
# ──────────────────────────────────────────────────────────────────────────────

def test_parent_homework_crud(monkeypatch, tmp_path):
    from app import storage
    monkeypatch.setattr(storage, "_homework_path", lambda child: tmp_path / f"homework_{child}.json")

    resp = client.post("/api/parent/homework/Aliza", json={"subject": "Math", "title": "Fractions worksheet", "due_date": "2026-08-01"})
    assert resp.status_code == 200
    hw_id = resp.json()["id"]

    resp = client.get("/api/parent/homework/Aliza")
    assert resp.status_code == 200
    assert len(resp.json()["homework"]) == 1

    resp = client.patch(f"/api/parent/homework/Aliza/{hw_id}", json={"status": "done"})
    assert resp.status_code == 200
    assert resp.json()["status"] == "done"

    resp = client.delete(f"/api/parent/homework/Aliza/{hw_id}")
    assert resp.status_code == 200

    resp = client.get("/api/parent/homework/Aliza")
    assert len(resp.json()["homework"]) == 0


def test_parent_homework_unknown_child():
    resp = client.get("/api/parent/homework/Unknown")
    assert resp.status_code == 404


def test_parent_reading_log(monkeypatch, tmp_path):
    from app import storage
    monkeypatch.setattr(storage, "_reading_log_path", lambda child: tmp_path / f"reading_log_{child}.json")

    resp = client.post("/api/parent/reading-log/Aliza", json={"book": "Charlotte's Web", "author": "E.B. White", "pages": 30, "duration_mins": 45})
    assert resp.status_code == 200

    resp = client.get("/api/parent/reading-log/Aliza")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_pages"] == 30
    assert data["total_minutes"] == 45
    assert len(data["log"]) == 1


def test_parent_screen_time(monkeypatch, tmp_path):
    from app import storage
    monkeypatch.setattr(storage, "_screen_time_path", lambda child: tmp_path / f"screen_time_{child}.json")

    resp = client.post("/api/parent/screen-time/Aliza/add", json={"minutes": 45, "date": "2026-08-01"})
    assert resp.status_code == 200

    resp = client.post("/api/parent/screen-time/Aliza/add", json={"minutes": 30, "date": "2026-08-01"})
    assert resp.status_code == 200

    resp = client.get("/api/parent/screen-time/Aliza")
    assert resp.status_code == 200
    data = resp.json()
    assert data["daily"].get("2026-08-01") == 75


def test_parent_weekly_report():
    resp = client.get("/api/parent/weekly-report/Aliza")
    assert resp.status_code == 200
    data = resp.json()
    for field in ("child", "lesson_streak", "reading_sessions", "screen_time_minutes", "homework_pending"):
        assert field in data


def test_parent_weekly_report_unknown_child():
    resp = client.get("/api/parent/weekly-report/Unknown")
    assert resp.status_code == 404


# ── English Vocabulary Academy tests ────────────────────────────────────────
def test_vocabulary_overview():
    r = client.get("/api/vocabulary")
    assert r.status_code == 200
    data = r.json()
    assert "levels" in data
    assert len(data["levels"]) == 4

def test_vocabulary_level_beginner():
    r = client.get("/api/vocabulary/beginner")
    assert r.status_code == 200
    assert "categories" in r.json()

def test_vocabulary_level_quiz():
    r = client.get("/api/vocabulary/advanced/quiz")
    assert r.status_code == 200
    assert "quiz" in r.json()

def test_vocabulary_search():
    r = client.get("/api/vocabulary/search?q=red")
    assert r.status_code == 200
    results = r.json()["results"]
    assert any("red" in res["word"].lower() or "red" in res["meaning"].lower() for res in results)

def test_vocabulary_level_not_found():
    assert client.get("/api/vocabulary/nonexistent").status_code == 404


# ── STEM Laboratory tests ─────────────────────────────────────────────────────
def test_stem_overview():
    r = client.get("/api/stem-lab")
    assert r.status_code == 200
    disciplines = r.json()["disciplines"]
    ids = [d["id"] for d in disciplines]
    assert "physics" in ids
    assert "chemistry" in ids
    assert "biology" in ids

def test_stem_discipline_detail():
    r = client.get("/api/stem-lab/physics")
    assert r.status_code == 200
    data = r.json()
    assert "experiments" in data
    assert len(data["experiments"]) > 0

def test_stem_experiment_detail():
    r = client.get("/api/stem-lab/physics/gravity_drop")
    assert r.status_code == 200
    data = r.json()
    assert data["title"] == "Gravity & Free Fall"
    assert "steps" in data
    assert "quiz" in data

def test_stem_discipline_not_found():
    assert client.get("/api/stem-lab/unicorn").status_code == 404


# ── Non-Fiction Library tests ─────────────────────────────────────────────────
def test_nonfiction_overview():
    r = client.get("/api/nonfiction")
    assert r.status_code == 200
    cats = r.json()["categories"]
    ids = [c["id"] for c in cats]
    assert "science" in ids
    assert "history" in ids

def test_nonfiction_book_detail():
    r = client.get("/api/nonfiction/science/how_body_works")
    assert r.status_code == 200
    data = r.json()
    assert "summary" in data
    assert "key_facts" in data

def test_nonfiction_not_found():
    assert client.get("/api/nonfiction/fake_cat").status_code == 404


# ── Practical Skills tests ────────────────────────────────────────────────────
def test_practical_skills_overview():
    r = client.get("/api/practical-skills")
    assert r.status_code == 200
    pathways = [p["id"] for p in r.json()["pathways"]]
    assert "cooking" in pathways
    assert "first_aid" in pathways

def test_practical_skills_level():
    r = client.get("/api/practical-skills/cooking/beginner")
    assert r.status_code == 200
    data = r.json()
    assert "skills" in data
    assert "quiz" in data
    assert data["certificate"] == "Junior Chef"

def test_practical_skills_not_found():
    assert client.get("/api/practical-skills/flying/beginner").status_code == 404


# ── Virtual Museum tests ──────────────────────────────────────────────────────
def test_museum_overview():
    r = client.get("/api/museum")
    assert r.status_code == 200
    gallery_ids = [g["id"] for g in r.json()["galleries"]]
    assert "ancient_world" in gallery_ids
    assert "islamic_heritage" in gallery_ids

def test_museum_gallery_detail():
    r = client.get("/api/museum/ancient_world")
    assert r.status_code == 200
    data = r.json()
    assert "objects" in data
    assert len(data["objects"]) > 0

def test_museum_object_detail():
    r = client.get("/api/museum/ancient_world/rosetta_stone")
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "Rosetta Stone"
    assert "significance" in data
    assert "fun_fact" in data

def test_museum_search():
    r = client.get("/api/museum/search?q=egypt")
    assert r.status_code == 200
    assert len(r.json()["results"]) > 0

def test_museum_not_found():
    assert client.get("/api/museum/fake_gallery").status_code == 404


# ── World Literature Library tests ────────────────────────────────────────────
def test_world_literature_overview():
    r = client.get("/api/world-literature")
    assert r.status_code == 200
    sections = [s["id"] for s in r.json()["sections"]]
    assert "childrens_classics" in sections
    assert "young_adult" in sections

def test_world_literature_book():
    r = client.get("/api/world-literature/childrens_classics/alice_wonderland")
    assert r.status_code == 200
    data = r.json()
    assert "summary" in data
    assert "themes" in data
    assert "discussion" in data

def test_world_literature_not_found():
    assert client.get("/api/world-literature/fake/book").status_code == 404


# ── Critical Thinking Academy tests ──────────────────────────────────────────
def test_critical_thinking_overview():
    r = client.get("/api/critical-thinking")
    assert r.status_code == 200
    modules = [m["id"] for m in r.json()["modules"]]
    assert "logic_basics" in modules
    assert "logical_fallacies" in modules
    assert "media_literacy" in modules

def test_critical_thinking_lesson():
    r = client.get("/api/critical-thinking/logical_fallacies/ad_hominem")
    assert r.status_code == 200
    data = r.json()
    assert "explanation" in data
    assert "example" in data
    assert "quiz" in data

def test_critical_thinking_not_found():
    assert client.get("/api/critical-thinking/fake_module").status_code == 404


# ── Survival Skills tests ─────────────────────────────────────────────────────
def test_survival_skills_overview():
    r = client.get("/api/survival-skills")
    assert r.status_code == 200
    data = r.json()
    assert "categories" in data
    cat_ids = [c["id"] for c in data["categories"]]
    assert "outdoor_and_navigation" in cat_ids
    assert "emergency_preparedness" in cat_ids

def test_survival_skills_category():
    r = client.get("/api/survival-skills/outdoor_and_navigation")
    assert r.status_code == 200
    data = r.json()
    assert "skills" in data
    assert len(data["skills"]) > 0

def test_survival_skills_skill():
    r = client.get("/api/survival-skills/personal_safety/stranger_awareness")
    assert r.status_code == 200
    data = r.json()
    assert "quiz" in data

def test_survival_skills_not_found():
    assert client.get("/api/survival-skills/fake_cat").status_code == 404
    assert client.get("/api/survival-skills/outdoor_and_navigation/fake_skill").status_code == 404


# ── Brain Teasers tests ───────────────────────────────────────────────────────
def test_brain_teasers_overview():
    r = client.get("/api/brain-teasers")
    assert r.status_code == 200
    data = r.json()
    assert "categories" in data
    cat_ids = [c["id"] for c in data["categories"]]
    assert "riddles" in cat_ids
    assert "logic_puzzles" in cat_ids
    assert "maths_challenges" in cat_ids
    assert "word_games" in cat_ids

def test_brain_teasers_category():
    r = client.get("/api/brain-teasers/riddles")
    assert r.status_code == 200
    data = r.json()
    assert "items" in data
    assert len(data["items"]) >= 5

def test_brain_teasers_not_found():
    assert client.get("/api/brain-teasers/fake_cat").status_code == 404


# ── Environmental Science tests ───────────────────────────────────────────────
def test_environmental_science_overview():
    r = client.get("/api/environmental-science")
    assert r.status_code == 200
    data = r.json()
    assert "units" in data
    unit_ids = [u["id"] for u in data["units"]]
    assert "ecosystems" in unit_ids
    assert "climate_systems" in unit_ids
    assert "sustainability" in unit_ids

def test_environmental_science_unit():
    r = client.get("/api/environmental-science/ecosystems")
    assert r.status_code == 200
    data = r.json()
    assert "topics" in data
    assert len(data["topics"]) >= 2

def test_environmental_science_topic():
    r = client.get("/api/environmental-science/climate_systems/greenhouse_effect")
    assert r.status_code == 200
    data = r.json()
    assert "content" in data
    assert "key_facts" in data
    assert "quiz" in data

def test_environmental_science_not_found():
    assert client.get("/api/environmental-science/fake_unit").status_code == 404
    assert client.get("/api/environmental-science/ecosystems/fake_topic").status_code == 404


# ── World Politics tests ──────────────────────────────────────────────────────
def test_world_politics_overview():
    r = client.get("/api/world-politics")
    assert r.status_code == 200
    data = r.json()
    assert "modules" in data
    mod_ids = [m["id"] for m in data["modules"]]
    assert "how_governments_work" in mod_ids
    assert "international_organisations" in mod_ids
    assert "global_issues" in mod_ids
    assert "geopolitics" in mod_ids

def test_world_politics_module():
    r = client.get("/api/world-politics/international_organisations")
    assert r.status_code == 200
    data = r.json()
    assert "lessons" in data
    assert len(data["lessons"]) >= 1

def test_world_politics_lesson():
    r = client.get("/api/world-politics/international_organisations/united_nations")
    assert r.status_code == 200
    data = r.json()
    assert "explanation" in data
    assert "example" in data
    assert "quiz" in data

def test_world_politics_not_found():
    assert client.get("/api/world-politics/fake_module").status_code == 404
    assert client.get("/api/world-politics/geopolitics/fake_lesson").status_code == 404


# ── Health Education tests ────────────────────────────────────────────────────
def test_health_education_overview():
    r = client.get("/api/health-education")
    assert r.status_code == 200
    data = r.json()
    assert "units" in data
    unit_ids = [u["id"] for u in data["units"]]
    assert "human_body" in unit_ids
    assert "nutrition" in unit_ids
    assert "mental_health" in unit_ids
    assert "first_aid" in unit_ids

def test_health_education_unit():
    r = client.get("/api/health-education/nutrition")
    assert r.status_code == 200
    data = r.json()
    assert "topics" in data
    assert len(data["topics"]) >= 1

def test_health_education_topic():
    r = client.get("/api/health-education/first_aid/cpr_basics")
    assert r.status_code == 200
    data = r.json()
    assert "content" in data
    assert "quiz" in data

def test_health_education_not_found():
    assert client.get("/api/health-education/fake_unit").status_code == 404
    assert client.get("/api/health-education/nutrition/fake_topic").status_code == 404


# ── Business Studies tests ────────────────────────────────────────────────────
def test_business_studies_overview():
    r = client.get("/api/business-studies")
    assert r.status_code == 200
    data = r.json()
    assert "modules" in data
    mod_ids = [m["id"] for m in data["modules"]]
    assert "enterprise" in mod_ids
    assert "marketing" in mod_ids
    assert "finance" in mod_ids

def test_business_studies_module():
    r = client.get("/api/business-studies/enterprise")
    assert r.status_code == 200
    data = r.json()
    assert "lessons" in data
    assert len(data["lessons"]) >= 1

def test_business_studies_lesson():
    r = client.get("/api/business-studies/finance/revenue_costs_profit")
    assert r.status_code == 200
    data = r.json()
    assert "explanation" in data
    assert "example" in data
    assert "quiz" in data

def test_business_studies_not_found():
    assert client.get("/api/business-studies/fake_module").status_code == 404
    assert client.get("/api/business-studies/marketing/fake_lesson").status_code == 404


# ── Attendance Tracking tests ─────────────────────────────────────────────────
def test_attendance_get_empty():
    r = client.get("/api/parent/attendance/Aliza")
    assert r.status_code == 200
    data = r.json()
    assert "records" in data

def test_attendance_add_and_summary():
    client.post("/api/parent/attendance/Aliza",
        json={"date": "2025-01-15", "status": "present", "note": "On time"})
    client.post("/api/parent/attendance/Aliza",
        json={"date": "2025-01-16", "status": "absent", "note": "Sick"})
    r = client.get("/api/parent/attendance/Aliza/summary")
    assert r.status_code == 200
    data = r.json()
    assert "attendance_rate" in data
    assert "counts" in data
    assert data["counts"]["present"] >= 1

def test_attendance_invalid_child():
    assert client.get("/api/parent/attendance/Unknown").status_code == 404


# ── Civics tests ──────────────────────────────────────────────────────────────
def test_civics_overview():
    r = client.get("/api/civics")
    assert r.status_code == 200
    data = r.json()
    assert "modules" in data
    mod_ids = [m["id"] for m in data["modules"]]
    assert "rights_responsibilities" in mod_ids
    assert "democratic_systems" in mod_ids
    assert "rule_of_law" in mod_ids
    assert "community_action" in mod_ids

def test_civics_module():
    r = client.get("/api/civics/democratic_systems")
    assert r.status_code == 200
    data = r.json()
    assert "lessons" in data
    assert len(data["lessons"]) >= 1

def test_civics_lesson():
    r = client.get("/api/civics/rights_responsibilities/human_rights_basics")
    assert r.status_code == 200
    data = r.json()
    assert "explanation" in data
    assert "quiz" in data

def test_civics_not_found():
    assert client.get("/api/civics/fake_module").status_code == 404
    assert client.get("/api/civics/rule_of_law/fake_lesson").status_code == 404


# ── Museum expansion test ─────────────────────────────────────────────────────
def test_museum_has_more_objects():
    r = client.get("/api/museum")
    assert r.status_code == 200
    galleries = r.json()["galleries"]
    total = sum(g["object_count"] for g in galleries)
    assert total >= 35
