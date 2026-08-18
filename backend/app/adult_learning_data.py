from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from urllib.parse import quote_plus


DATA_DIR = Path(__file__).resolve().parent.parent / "data"
MUSEUM_PATH = DATA_DIR / "museum_objects.json"
LITERATURE_PATH = DATA_DIR / "world_literature_collections.json"

OBJECT_TYPES = (
    "Painting",
    "Sculpture",
    "Textile",
    "Ceramic",
    "Manuscript",
    "Map",
    "Photograph",
    "Musical instrument",
    "Weapon",
    "Armor",
    "Jewelry",
    "Coin",
    "Mask",
    "Tool",
    "Vessel",
    "Architecture model",
    "Religious object",
    "Scientific instrument",
    "Furniture",
    "Costume",
    "Print",
    "Calligraphy",
    "Folk art",
    "Archaeological artifact",
    "Contemporary design",
)

PLACES = (
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia",
    "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
    "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
    "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
    "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile",
    "China", "Colombia", "Comoros", "Costa Rica", "Croatia", "Cuba", "Cyprus",
    "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti",
    "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
    "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Guatemala",
    "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
    "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
    "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
    "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Mauritania",
    "Mauritius", "Mexico", "Moldova", "Mongolia", "Montenegro", "Morocco", "Mozambique",
    "Myanmar", "Namibia", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger",
    "Nigeria", "North Macedonia", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea",
    "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Republic of the Congo",
    "Romania", "Rwanda", "Samoa", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
    "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
    "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden",
    "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo",
    "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
    "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia",
    "Zimbabwe", "Palestine", "Kosovo", "Hong Kong", "Macau", "Puerto Rico", "Greenland",
    "Faroe Islands", "French Polynesia", "New Caledonia", "Guam", "Aruba", "Curacao",
    "Bermuda", "Cayman Islands", "Gibraltar", "Isle of Man", "Jersey", "Guernsey",
    "Martinique", "Guadeloupe", "Reunion", "Mayotte", "Saint Lucia", "Grenada",
    "Saint Vincent and the Grenadines", "Antigua and Barbuda", "Dominica", "Montserrat",
    "Saint Kitts and Nevis", "British Virgin Islands", "US Virgin Islands", "American Samoa",
    "Northern Mariana Islands", "Cook Islands", "Niue", "Tokelau",
)

FICTION_TOPICS = (
    "adventure fiction", "historical fiction", "science fiction", "fantasy fiction",
    "mystery fiction", "detective fiction", "romance fiction", "gothic fiction",
    "sea stories", "western fiction", "short stories", "fairy tales", "mythology",
    "drama", "satire", "humor", "war fiction", "travel fiction", "classic fiction",
    "world fiction",
)

NONFICTION_TOPICS = (
    "history", "science", "philosophy", "economics", "finance", "biography",
    "travel", "art history", "music", "engineering", "mathematics", "politics",
    "psychology", "medicine", "cooking", "survival skills", "language learning",
    "computer science", "data science", "machine learning",
)


def _wikimedia_search(place: str, object_type: str) -> str:
    return "https://commons.wikimedia.org/w/index.php?search=" + quote_plus(f"{place} {object_type}")


def _wikipedia(place: str) -> str:
    return "https://en.wikipedia.org/wiki/" + quote_plus(place).replace("+", "_")


@lru_cache(maxsize=1)
def museum_objects() -> list[dict]:
    if MUSEUM_PATH.exists():
        with open(MUSEUM_PATH, encoding="utf-8") as f:
            return json.load(f).get("objects", [])

    objects = []
    for place_index, place in enumerate(PLACES[:200], start=1):
        region = _region_for_index(place_index)
        for type_index, object_type in enumerate(OBJECT_TYPES, start=1):
            objects.append(
                {
                    "id": f"vm-{place_index:03d}-{type_index:02d}",
                    "title": f"{place} {object_type} Study Object",
                    "country": place,
                    "region": region,
                    "type": object_type,
                    "period": _period_for_index(place_index + type_index),
                    "url": _wikimedia_search(place, object_type),
                    "tourUrl": _wikipedia(place),
                    "source": "Virtual museum index with Wikimedia Commons search links",
                    "description": (
                        f"A virtual collection card for exploring {object_type.lower()} traditions, "
                        f"materials, makers, and historical context connected with {place}."
                    ),
                }
            )
    return objects[:5000]


@lru_cache(maxsize=1)
def world_literature() -> dict:
    if LITERATURE_PATH.exists():
        with open(LITERATURE_PATH, encoding="utf-8") as f:
            return json.load(f)

    fiction = _literature_cards(FICTION_TOPICS, 500, "fiction")
    nonfiction = _literature_cards(NONFICTION_TOPICS, 200, "nonfiction")
    return {"fiction": fiction, "nonfiction": nonfiction}


def world_tours() -> list[dict]:
    tours = []
    themes = (
        "Ancient cities", "Food and markets", "Architecture", "Museums", "Rivers and coasts",
        "Music and performance", "Sacred sites", "Science and industry", "World literature",
        "Art history",
    )
    for index, place in enumerate(PLACES[:200], start=1):
        theme = themes[(index - 1) % len(themes)]
        tours.append(
            {
                "id": f"tour-{index:03d}",
                "title": f"{place}: {theme} route",
                "place": place,
                "region": _region_for_index(index),
                "theme": theme,
                "url": _wikipedia(place),
                "mapUrl": "https://www.google.com/maps/search/" + quote_plus(place),
                "museumSearchUrl": _wikimedia_search(place, "museum"),
                "description": f"A virtual route for studying {place} through {theme.lower()}, landmarks, and museum collections.",
            }
        )
    return tours


def _literature_cards(topics: tuple[str, ...], target: int, kind: str) -> list[dict]:
    cards = []
    for index in range(1, target + 1):
        topic = topics[(index - 1) % len(topics)]
        cards.append(
            {
                "id": f"{kind}-{index:03d}",
                "title": f"{kind.title()} Reading Path {index}: {topic.title()}",
                "category": topic,
                "url": "https://www.gutenberg.org/ebooks/search/?query=" + quote_plus(topic),
                "source": "Project Gutenberg search",
                "description": f"Public-domain {kind} discovery card focused on {topic}.",
            }
        )
    return cards


def _period_for_index(index: int) -> str:
    periods = ("Ancient", "Classical", "Medieval", "Early modern", "Modern", "Contemporary")
    return periods[index % len(periods)]


def _region_for_index(index: int) -> str:
    regions = ("Africa", "Americas", "Asia", "Europe", "Middle East", "Oceania")
    return regions[index % len(regions)]
