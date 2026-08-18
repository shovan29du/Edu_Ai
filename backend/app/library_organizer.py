"""Physically files a scanned book into an organized library folder created
inside its scanned root, once Ark AI has classified it (see the Resource
Tab's "Analyze" button, ai_tutor.analyze_book_for_library):

- Literature goes under ``<root>/EduAI_Pro Library/<A-Z or #>/<Author>/`` --
  27 first-letter folders (A-Z plus a "#" catch-all for authors whose first
  name doesn't start with a plain letter), each containing one folder per
  author, filed by that author's first name.
- Textbooks go under ``<root>/EduAI_Pro Library/Reference/<Subject>/``.

This only ever runs for a book the owner explicitly analyzed -- never
automatically during a bulk folder scan -- and only moves/renames within
the same scanned root, never elsewhere on disk.
"""

import re
import shutil
from pathlib import Path

LIBRARY_DIRNAME = "EduAI_Pro Library"
REFERENCE_DIRNAME = "Reference"
CATCH_ALL_LETTER = "#"

_INVALID_CHARS = re.compile(r'[<>:"/\\|?*\x00-\x1f]')


def _safe_folder_name(value: str, fallback: str) -> str:
    value = _INVALID_CHARS.sub("", (value or "").strip())
    value = re.sub(r"\s+", " ", value).strip(" .")
    return value[:120] or fallback


def author_initial(author: str) -> str:
    """The A-Z (or "#") folder a literature author files under, keyed by
    the first letter of their first name."""
    first_name = (author or "").strip().split(" ")[0] if author else ""
    letter = first_name[:1].upper()
    return letter if letter.isascii() and letter.isalpha() else CATCH_ALL_LETTER


def _unique_destination(directory: Path, filename: str) -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    candidate = directory / filename
    if not candidate.exists():
        return candidate
    stem, suffix = Path(filename).stem, Path(filename).suffix
    counter = 2
    while True:
        candidate = directory / f"{stem} ({counter}){suffix}"
        if not candidate.exists():
            return candidate
        counter += 1


def move_literature(root: Path, resolved_path: Path, author: str) -> Path:
    author_folder = _safe_folder_name(author, "Unknown Author")
    destination_dir = root / LIBRARY_DIRNAME / author_initial(author) / author_folder
    destination = _unique_destination(destination_dir, resolved_path.name)
    shutil.move(str(resolved_path), str(destination))
    return destination


def move_textbook(root: Path, resolved_path: Path, subject: str) -> Path:
    subject_folder = _safe_folder_name(subject, "General")
    destination_dir = root / LIBRARY_DIRNAME / REFERENCE_DIRNAME / subject_folder
    destination = _unique_destination(destination_dir, resolved_path.name)
    shutil.move(str(resolved_path), str(destination))
    return destination
