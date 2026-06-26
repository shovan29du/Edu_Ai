import os

import httpx

BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search"


class SearchNotConfigured(Exception):
    pass


def web_search(query: str, count: int = 10) -> list[dict]:
    """Live web search for the parent-only curation flow.

    Requires BRAVE_SEARCH_API_KEY (free tier available at https://brave.com/search/api/).
    No key is bundled with this app — configure it in the backend environment
    before this endpoint will return live results.
    """
    api_key = os.environ.get("BRAVE_SEARCH_API_KEY")
    if not api_key:
        raise SearchNotConfigured(
            "Web search is not configured. Set the BRAVE_SEARCH_API_KEY environment "
            "variable on the backend to enable live resource search for the Parent account."
        )

    response = httpx.get(
        BRAVE_SEARCH_URL,
        params={"q": query, "count": count},
        headers={"Accept": "application/json", "X-Subscription-Token": api_key},
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()

    results = []
    for item in data.get("web", {}).get("results", []):
        results.append(
            {
                "title": item.get("title", ""),
                "url": item.get("url", ""),
                "description": item.get("description", ""),
            }
        )
    return results
