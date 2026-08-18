"""Local, single-owner app configuration: API keys for every major model
provider Ark AI's model library lists, plus which (optional) alternate
model to prefer over the default Claude.

Stored in a gitignored JSON file under backend/data/ so a non-technical owner
can paste keys into the Appearance settings screen instead of having to set
OS environment variables by hand. Raw keys are never returned to the
frontend once saved -- only a masked preview.
"""

import json
from pathlib import Path
from threading import Lock

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SETTINGS_PATH = DATA_DIR / "app_settings.json"

# Anthropic (Claude) is always the built-in default and needs no key here in
# the common case (it also honours the ANTHROPIC_API_KEY environment
# variable as a fallback). Every other provider is one Ark AI lists in its
# model library and can call once its key is set.
PROVIDERS = (
    "anthropic", "openai", "gemini", "grok", "groq", "mistral",
    "together", "perplexity", "fireworks", "deepseek", "openrouter",
)

_lock = Lock()


def _read() -> dict:
    try:
        return json.loads(SETTINGS_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def _write(data: dict) -> None:
    DATA_DIR.mkdir(exist_ok=True)
    SETTINGS_PATH.write_text(json.dumps(data, indent=2), encoding="utf-8")


def _key_field(provider: str) -> str:
    return f"{provider}_api_key"


def mask_key(key: str) -> str:
    key = key.strip()
    if len(key) <= 8:
        return "*" * len(key)
    return f"{key[:6]}...{key[-4:]}"


def get_api_key(provider: str) -> str:
    with _lock:
        return str(_read().get(_key_field(provider)) or "")


def set_api_key(provider: str, key: str) -> None:
    key = key.strip()
    if not key:
        raise ValueError("API key cannot be empty")
    with _lock:
        data = _read()
        data[_key_field(provider)] = key
        _write(data)


def clear_api_key(provider: str) -> None:
    with _lock:
        data = _read()
        data.pop(_key_field(provider), None)
        _write(data)


# Backward-compatible Anthropic-specific wrappers (pre-dates the generic,
# multi-provider store above; kept so existing call sites/endpoints for the
# always-available default provider don't need to change).
def get_anthropic_api_key() -> str:
    return get_api_key("anthropic")


def set_anthropic_api_key(key: str) -> None:
    set_api_key("anthropic", key)


def clear_anthropic_api_key() -> None:
    clear_api_key("anthropic")


def get_preferred_model() -> str:
    with _lock:
        return str(_read().get("preferred_model") or "")


def set_preferred_model(model_id: str) -> None:
    with _lock:
        data = _read()
        data["preferred_model"] = model_id
        _write(data)


def clear_preferred_model() -> None:
    with _lock:
        data = _read()
        data.pop("preferred_model", None)
        _write(data)
