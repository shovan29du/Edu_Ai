"""Tests for new features: Assessment Centre, STEM Lab, World Politics, World Religions, Critical Thinking."""
import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

DATA_DIR = Path(__file__).parent.parent / "data"


# ─── JSON validity ────────────────────────────────────────────────────────────

def test_assessment_json_valid():
    path = DATA_DIR / "assessment" / "assessments.json"
    assert path.exists(), "assessments.json must exist"
    data = json.loads(path.read_text())
    assert "age_groups" in data
    assert isinstance(data["age_groups"], dict)


def test_stem_lab_json_valid():
    path = DATA_DIR / "stem_lab" / "stem_lab.json"
    assert path.exists()
    data = json.loads(path.read_text())
    assert "disciplines" in data
    assert len(data["disciplines"]) >= 5


def test_world_politics_json_valid():
    path = DATA_DIR / "world_politics" / "world_politics.json"
    assert path.exists()
    data = json.loads(path.read_text())
    assert "modules" in data
    assert "country_profiles" in data["modules"]
    countries = data["modules"]["country_profiles"]["countries"]
    assert len(countries) >= 5
    # Check required country fields
    for cid, country in countries.items():
        assert "name" in country, f"Country {cid} missing name"
        assert "government_type" in country, f"Country {cid} missing government_type"


def test_world_religions_json_valid():
    path = DATA_DIR / "world_religions" / "world_religions.json"
    assert path.exists(), "world_religions.json must exist"
    data = json.loads(path.read_text())
    assert "religions" in data
    religions = data["religions"]
    assert len(religions) >= 4
    # Check required fields for each religion
    for rid, rel in religions.items():
        assert "name" in rel, f"Religion {rid} missing name"
        assert "beliefs" in rel, f"Religion {rid} missing beliefs"
        assert "festivals" in rel, f"Religion {rid} missing festivals"
        assert "sacred_texts" in rel, f"Religion {rid} missing sacred_texts"
        assert "cultural_contributions" in rel, f"Religion {rid} missing cultural_contributions"


def test_critical_thinking_json_valid():
    path = DATA_DIR / "critical_thinking" / "critical_thinking.json"
    assert path.exists()
    data = json.loads(path.read_text())
    assert "modules" in data
    modules = data["modules"]
    assert len(modules) >= 5
    expected_modules = ["logic_basics", "logical_fallacies", "evidence_evaluation", "media_literacy"]
    for mod in expected_modules:
        assert mod in modules, f"Module {mod} missing from critical thinking"


# ─── Assessment Centre API ────────────────────────────────────────────────────

def test_assessment_age_groups_endpoint():
    resp = client.get("/api/assessment/age-groups")
    assert resp.status_code == 200
    body = resp.json()
    assert "age_groups" in body
    assert len(body["age_groups"]) >= 4


def test_assessment_get_age_group():
    resp = client.get("/api/assessment/7-9")
    assert resp.status_code == 200
    body = resp.json()
    assert "sections" in body or "label" in body


def test_assessment_age_group_not_found():
    resp = client.get("/api/assessment/99-99")
    assert resp.status_code == 404


def test_assessment_submit_aliza():
    payload = {
        "age_group": "7-9",
        "answers": {"0-0": 1, "0-1": 1},
        "score": 2,
        "total": 5,
        "skills_demonstrated": ["subtraction", "multiplication"]
    }
    resp = client.post("/api/assessment/Aliza/submit", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert "score" in body
    assert "percentage" in body


def test_assessment_submit_unknown_child():
    payload = {"age_group": "7-9", "answers": {}, "score": 0, "total": 5}
    resp = client.post("/api/assessment/UnknownChild123/submit", json=payload)
    assert resp.status_code == 404


# ─── STEM Lab API ─────────────────────────────────────────────────────────────

def test_stem_lab_overview():
    resp = client.get("/api/stem-lab")
    assert resp.status_code == 200
    body = resp.json()
    assert "disciplines" in body
    assert len(body["disciplines"]) >= 5


def test_stem_lab_discipline_physics():
    resp = client.get("/api/stem-lab/physics")
    assert resp.status_code == 200
    body = resp.json()
    assert "experiments" in body
    assert len(body["experiments"]) >= 1


def test_stem_lab_discipline_not_found():
    resp = client.get("/api/stem-lab/alchemy")
    assert resp.status_code == 404


def test_stem_lab_experiment_detail():
    # Get the first experiment from physics
    disc_resp = client.get("/api/stem-lab/physics")
    assert disc_resp.status_code == 200
    experiments = disc_resp.json()["experiments"]
    if experiments:
        exp_id = experiments[0]["id"]
        resp = client.get(f"/api/stem-lab/physics/{exp_id}")
        assert resp.status_code == 200
        body = resp.json()
        assert "title" in body
        assert "explanation" in body


# ─── World Politics API ───────────────────────────────────────────────────────

def test_world_politics_overview():
    resp = client.get("/api/world-politics")
    assert resp.status_code == 200
    body = resp.json()
    assert "modules" in body
    assert len(body["modules"]) >= 4


def test_world_politics_module():
    resp = client.get("/api/world-politics/how_governments_work")
    assert resp.status_code == 200
    body = resp.json()
    assert "lessons" in body


def test_world_politics_countries_list():
    resp = client.get("/api/world-politics/countries")
    assert resp.status_code == 200
    body = resp.json()
    assert "countries" in body
    assert len(body["countries"]) >= 5


def test_world_politics_country_profile():
    resp = client.get("/api/world-politics/countries/united_kingdom")
    assert resp.status_code == 200
    body = resp.json()
    assert "name" in body
    assert "government_type" in body
    assert body["name"] == "United Kingdom"


def test_world_politics_country_not_found():
    resp = client.get("/api/world-politics/countries/nonexistent_country")
    assert resp.status_code == 404


def test_world_politics_lesson():
    resp = client.get("/api/world-politics/how_governments_work/democracy_types")
    assert resp.status_code == 200
    body = resp.json()
    assert "title" in body
    assert "explanation" in body


# ─── World Religions API ──────────────────────────────────────────────────────

def test_world_religions_overview():
    resp = client.get("/api/world-religions")
    assert resp.status_code == 200
    body = resp.json()
    assert "religions" in body
    assert len(body["religions"]) >= 4


def test_world_religion_islam():
    resp = client.get("/api/world-religions/islam")
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Islam"
    assert "beliefs" in body
    assert "festivals" in body
    assert "sacred_texts" in body
    assert "cultural_contributions" in body
    assert "history" in body


def test_world_religion_not_found():
    resp = client.get("/api/world-religions/pastafarianism")
    assert resp.status_code == 404


# ─── Smoke tests for existing endpoints ───────────────────────────────────────

def test_grade_1_still_works():
    resp = client.get("/api/grade/1")
    assert resp.status_code == 200
    assert "subjects" in resp.json()


def test_ai_tutor_ask_still_works():
    resp = client.post("/api/ai-tutor/ask", json={"question": "What is gravity?", "grade": 5})
    assert resp.status_code == 200
    assert "answer" in resp.json()


def test_progress_endpoints_still_work():
    resp = client.get("/api/progress/Aliza")
    assert resp.status_code == 200


def test_critical_thinking_overview_still_works():
    resp = client.get("/api/critical-thinking")
    assert resp.status_code == 200
    body = resp.json()
    assert "modules" in body
    assert len(body["modules"]) >= 5

# ── Song Centre tests ─────────────────────────────────────────────────────────
def test_songs_overview():
    r = client.get("/api/songs")
    assert r.status_code == 200
    data = r.json()
    assert data["total"] >= 950
    assert len(data["songs"]) >= 950
    assert "genres" in data
    assert "decades" in data

def test_songs_have_required_fields():
    r = client.get("/api/songs")
    songs = r.json()["songs"]
    for s in songs[:10]:
        assert "id" in s
        assert "title" in s
        assert "artist" in s
        assert "year" in s
        assert "links" in s

def test_song_detail():
    r = client.get("/api/songs/bohemian_rhapsody")
    assert r.status_code == 200
    data = r.json()
    assert data["title"] == "Bohemian Rhapsody"
    assert "artist" in data
    assert "educational_notes" in data

def test_bangla_song_detail():
    r = client.get("/api/songs/amar_sonar_bangla")
    assert r.status_code == 200
    data = r.json()
    assert data["language"] == "Bengali"
    assert "rabindra_sangeet" in data["genre"]

def test_songs_by_genre():
    r = client.get("/api/songs/genre/rock")
    assert r.status_code == 200
    assert r.json()["count"] > 0

def test_songs_by_genre_bangla():
    r = client.get("/api/songs/genre/rabindra_sangeet")
    assert r.status_code == 200
    assert r.json()["count"] >= 25

def test_songs_by_decade():
    r = client.get("/api/songs/decade/1970s")
    assert r.status_code == 200
    assert r.json()["count"] > 10

def test_song_not_found():
    r = client.get("/api/songs/totally_fake_song_xyz")
    assert r.status_code == 404

def test_songs_json_valid():
    import json
    from pathlib import Path
    p = Path(__file__).parent.parent / "data" / "song_centre" / "songs.json"
    data = json.loads(p.read_text())
    assert data["total"] >= 950
    assert len(data["songs"]) >= 950
    bangla = [s for s in data["songs"] if "Bengali" in s.get("language","")]
    assert len(bangla) >= 200
