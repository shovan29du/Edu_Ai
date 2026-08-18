"""Ark AI Library: the full prompt library, model catalog, and free
tools/apps/plugins directory carried over from the Ark_Ai zip's own
"Prompts" panel, model picker, and connections list. All three are static
reference data (no external calls), extracted verbatim from that project so
nothing here is invented. Browsing a prompt lets it be used as extra
"context" for an Ark AI conversation. Claude is always the built-in default
model; once the owner adds an API key for another provider in Appearance
settings and picks one of its models as their "preferred model" (see
settings_store.py / llm_providers.py), Ark AI actually calls that provider
too instead of Claude."""

import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ARK_AI_DATA_DIR = BASE_DIR / "data" / "ark_ai"

# Maps each model's models.json "provider" display name to the internal
# provider slug used by settings_store.PROVIDERS / llm_providers.PROVIDERS.
PROVIDER_SLUGS = {
    "Claude": "anthropic",
    "Openai": "openai",
    "Gemini": "gemini",
    "Grok": "grok",
    "Groq": "groq",
    "Mistral": "mistral",
    "Together": "together",
    "Perplexity": "perplexity",
    "Fireworks": "fireworks",
    "Deepseek": "deepseek",
    "OpenRouter (free)": "openrouter",
}


def _load(name: str) -> list:
    path = ARK_AI_DATA_DIR / name
    with open(path, encoding="utf-8") as f:
        return json.load(f)


_PROMPTS = _load("prompts.json")
_MODELS = _load("models.json")
_TOOLS = _load("tools.json")

PROMPT_TAGS = sorted({p["tag"] for p in _PROMPTS if p.get("tag")})
TOOL_CATEGORIES = sorted({t["category"] for t in _TOOLS if t.get("category")})
TOOL_KINDS = sorted({t["kind"] for t in _TOOLS if t.get("kind")})


def list_prompts(query: str = "", tag: str = "", limit: int = 50) -> list:
    results = _PROMPTS
    if tag:
        results = [p for p in results if p.get("tag") == tag]
    q = query.strip().lower()
    if q:
        results = [
            p for p in results
            if q in p.get("name", "").lower() or q in p.get("prompt", "").lower()
        ]
    return results[:limit]


def get_prompt(prompt_id: str) -> dict | None:
    for p in _PROMPTS:
        if p["id"] == prompt_id:
            return p
    return None


def list_models() -> list:
    return _MODELS


def get_model(model_id: str) -> dict | None:
    for m in _MODELS:
        if m["id"] == model_id:
            return m
    return None


def list_tools(query: str = "", category: str = "", kind: str = "", limit: int = 100) -> list:
    results = _TOOLS
    if category:
        results = [t for t in results if t.get("category") == category]
    if kind:
        results = [t for t in results if t.get("kind") == kind]
    q = query.strip().lower()
    if q:
        results = [
            t for t in results
            if q in t.get("name", "").lower() or q in t.get("note", "").lower()
        ]
    return results[:limit]
