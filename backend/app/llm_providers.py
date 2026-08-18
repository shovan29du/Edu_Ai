"""Generic multi-provider LLM calling for Ark AI's alternate models.

Claude (the always-available default) is called directly via the anthropic
SDK in ai_tutor.py. Every other provider Ark AI's model library lists --
OpenAI, Mistral, xAI (Grok), Groq, Together, Perplexity, Fireworks,
DeepSeek, and OpenRouter -- exposes an OpenAI-compatible /chat/completions
REST endpoint, so one generic caller covers all of them; no provider SDK is
required, just an HTTPS POST with a JSON body. Gemini's REST API has its
own request/response shape and gets its own small caller.
"""

import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

_TIMEOUT = 30

_OPENAI_COMPATIBLE_URLS = {
    "openai": "https://api.openai.com/v1/chat/completions",
    "mistral": "https://api.mistral.ai/v1/chat/completions",
    "grok": "https://api.x.ai/v1/chat/completions",
    "groq": "https://api.groq.com/openai/v1/chat/completions",
    "together": "https://api.together.xyz/v1/chat/completions",
    "perplexity": "https://api.perplexity.ai/chat/completions",
    "fireworks": "https://api.fireworks.ai/inference/v1/chat/completions",
    "deepseek": "https://api.deepseek.com/v1/chat/completions",
    "openrouter": "https://openrouter.ai/api/v1/chat/completions",
}

GEMINI_PROVIDER = "gemini"

PROVIDERS = tuple(_OPENAI_COMPATIBLE_URLS) + (GEMINI_PROVIDER,)


class ProviderCallError(Exception):
    """Raised for any network, HTTP, or unexpected-response-shape failure."""


def _post_json(url: str, headers: dict, payload: dict) -> dict:
    data = json.dumps(payload).encode("utf-8")
    req = Request(url, data=data, headers={**headers, "Content-Type": "application/json"}, method="POST")
    try:
        with urlopen(req, timeout=_TIMEOUT) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except HTTPError as exc:
        raise ProviderCallError(f"HTTP {exc.code}") from exc
    except (URLError, TimeoutError, ValueError) as exc:
        raise ProviderCallError(str(exc)) from exc


def _call_openai_compatible(provider: str, api_key: str, model: str, system: str, user: str, max_tokens: int) -> str:
    url = _OPENAI_COMPATIBLE_URLS[provider]
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "max_tokens": max_tokens,
    }
    body = _post_json(url, {"Authorization": f"Bearer {api_key}"}, payload)
    try:
        return body["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise ProviderCallError(f"Unexpected response shape from {provider}") from exc


def _call_gemini(api_key: str, model: str, system: str, user: str, max_tokens: int) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    payload = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": user}]}],
        "generationConfig": {"maxOutputTokens": max_tokens},
    }
    body = _post_json(url, {}, payload)
    try:
        return body["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (KeyError, IndexError, TypeError) as exc:
        raise ProviderCallError("Unexpected response shape from gemini") from exc


def call_chat(provider: str, model: str, api_key: str, system: str, user: str, max_tokens: int = 512) -> str:
    if provider == GEMINI_PROVIDER:
        return _call_gemini(api_key, model, system, user, max_tokens)
    if provider in _OPENAI_COMPATIBLE_URLS:
        return _call_openai_compatible(provider, api_key, model, system, user, max_tokens)
    raise ProviderCallError(f"Unknown provider '{provider}'")
