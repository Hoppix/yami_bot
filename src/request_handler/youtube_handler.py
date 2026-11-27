"""created by IrateGod on 20/10/2018"""

from typing import Any

import aiohttp

YOUTUBE_API_URL_BASE = "https://www.googleapis.com/youtube/v3/search"


class YoutubeSearchError(Exception):
    pass


async def youtube_search_request(search_query: list[str], api_key: str) -> dict[str, Any]:
    """Look up a specified YouTube video. Only match the first result."""
    params = {
        "maxResults": 1,
        "part": "snippet",
        "q": " ".join(search_query),
        "key": api_key,
    }
    async with aiohttp.ClientSession() as session, session.get(YOUTUBE_API_URL_BASE, params=params) as response:
        if response.status != 200:
            raise YoutubeSearchError(f"YouTube API returned {response.status}")
        youtube_api_response = await response.json()

    items = youtube_api_response.get("items")
    if not items:
        raise YoutubeSearchError("No videos found.")
    return items[0]
