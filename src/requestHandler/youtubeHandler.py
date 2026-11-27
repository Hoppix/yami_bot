"""created by IrateGod on 20/10/2018"""

from typing import Any

import aiohttp

YOUTUBE_API_URL_BASE = "https://www.googleapis.com/youtube/v3/search"


class YoutubeSearchError(Exception):
    pass


async def youtubeSearchRequest(searchQuery: list[str], apiKey: str) -> dict[str, Any]:
    """Look up a specified YouTube video. Only match the first result."""
    params = {
        "maxResults": 1,
        "part": "snippet",
        "q": " ".join(searchQuery),
        "key": apiKey,
    }
    async with aiohttp.ClientSession() as session, session.get(YOUTUBE_API_URL_BASE, params=params) as response:
        if response.status != 200:
            raise YoutubeSearchError(f"YouTube API returned {response.status}")
        youtubeApiResponse = await response.json()

    items = youtubeApiResponse.get("items")
    if not items:
        raise YoutubeSearchError("No videos found.")
    return items[0]
