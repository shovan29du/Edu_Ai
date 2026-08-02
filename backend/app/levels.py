"""Central registry of every academic level the platform understands.

This is the single source of truth for levels — school grades through
master's degree — so that the frontend, the AI tutor, the safety filter,
and lesson/quiz generation never hardcode a separate list. New levels
should only ever be added here.
"""
from __future__ import annotations

SCHOOL_CATEGORY = "school"
COLLEGE_CATEGORY = "college"
UNDERGRADUATE_CATEGORY = "undergraduate"
MASTERS_CATEGORY = "masters"

CATEGORY_LABELS = {
    SCHOOL_CATEGORY: "School",
    COLLEGE_CATEGORY: "College",
    UNDERGRADUATE_CATEGORY: "Undergraduate",
    MASTERS_CATEGORY: "Master's",
}

# Ordered registry: id -> metadata. Order defines natural progression.
LEVELS: dict[str, dict] = {}


def _add(level_id: str, label: str, category: str, order: int, age_range: str, description: str) -> None:
    LEVELS[level_id] = {
        "id": level_id,
        "label": label,
        "category": category,
        "category_label": CATEGORY_LABELS[category],
        "order": order,
        "age_range": age_range,
        "description": description,
    }


for _grade in range(1, 11):
    _add(
        str(_grade),
        f"Grade {_grade}",
        SCHOOL_CATEGORY,
        _grade,
        f"{4 + _grade}-{5 + _grade}",
        f"School curriculum for Grade {_grade} learners.",
    )

_add("C1", "College Level 1", COLLEGE_CATEGORY, 11, "16-18",
     "First year of college / pre-university studies, bridging school and higher education.")
_add("C2", "College Level 2", COLLEGE_CATEGORY, 12, "17-19",
     "Second year of college / pre-university studies with more independent academic work.")
_add("UG1", "Undergraduate Year 1", UNDERGRADUATE_CATEGORY, 13, "18-19",
     "First year of a bachelor's degree — foundational theory and core subject grounding.")
_add("UG2", "Undergraduate Year 2", UNDERGRADUATE_CATEGORY, 14, "19-20",
     "Second year of a bachelor's degree — deeper theory and first applied coursework.")
_add("UG3", "Undergraduate Year 3", UNDERGRADUATE_CATEGORY, 15, "20-21",
     "Third year of a bachelor's degree — specialization, electives, and applied projects.")
_add("UG4", "Undergraduate Year 4", UNDERGRADUATE_CATEGORY, 16, "21-22",
     "Final year of a bachelor's degree — capstone projects and advanced specialization.")
_add("M1", "Master's Year 1", MASTERS_CATEGORY, 17, "22-24",
     "First year of a master's degree — graduate-level theory and research methods.")
_add("M2", "Master's Year 2", MASTERS_CATEGORY, 18, "23-26",
     "Final year of a master's degree — thesis/capstone research and advanced specialization.")

ADULT_CATEGORIES = (COLLEGE_CATEGORY, UNDERGRADUATE_CATEGORY, MASTERS_CATEGORY)


def all_levels() -> list[dict]:
    """All levels sorted by natural progression order."""
    return sorted(LEVELS.values(), key=lambda l: l["order"])


def get_level(level_id) -> dict | None:
    return LEVELS.get(normalize_level_id(level_id))


def normalize_level_id(level_id) -> str:
    """Accept ints, numeric strings, or level codes and return a canonical id."""
    if level_id is None:
        return ""
    text = str(level_id).strip()
    upper = text.upper()
    if upper in LEVELS:
        return upper
    return text


def is_valid_level(level_id) -> bool:
    return normalize_level_id(level_id) in LEVELS


def is_school_level(level_id) -> bool:
    level = get_level(level_id)
    return bool(level) and level["category"] == SCHOOL_CATEGORY


def is_adult_level(level_id) -> bool:
    level = get_level(level_id)
    return bool(level) and level["category"] in ADULT_CATEGORIES


def category_of(level_id) -> str | None:
    level = get_level(level_id)
    return level["category"] if level else None


def syllabus_filename(level_id: str) -> str:
    """Filename (without directory) of the syllabus JSON backing a level."""
    norm = normalize_level_id(level_id)
    if is_school_level(norm):
        return f"grade{norm}.json"
    return f"level_{norm.lower()}.json"
