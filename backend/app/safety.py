import json
import re
from pathlib import Path

SAFE_DIR = Path(__file__).resolve().parent.parent / "safe"


class SafetyFilter:
    def __init__(self):
        with open(SAFE_DIR / "blocked_words.json", encoding="utf-8") as f:
            self.blocked_words = json.load(f)["blocked_words"]
        self._pattern = re.compile(
            r"\b(" + "|".join(re.escape(w) for w in self.blocked_words) + r")\b",
            re.IGNORECASE,
        )

    def is_safe(self, text: str) -> bool:
        if not text:
            return True
        return self._pattern.search(text) is None

    def sanitize(self, text: str) -> str:
        if not text:
            return text
        return self._pattern.sub(lambda m: "*" * len(m.group(0)), text)

    def validate_resource(self, resource: dict) -> bool:
        for value in resource.values():
            if isinstance(value, str) and not self.is_safe(value):
                return False
        return True


safety_filter = SafetyFilter()
