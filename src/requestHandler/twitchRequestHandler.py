"""
Created by khopf on 10/01/2018.

Note: not wired up in bot.py, and the kraken API it polls was shut down by Twitch in 2022.
"""

import asyncio
import logging

import aiohttp
import discord

logger = logging.getLogger(__name__)

POLL_INTERVAL_SECONDS = 10


async def pollStream(chatChannel: discord.TextChannel, streamer: str, apiKey: str) -> None:
    """
    Polls the Twitch-API for the streamer.
    When the streamer goes online a message is sent to the chatChannel
    """
    callFlag = True
    headers = {"Client-ID": apiKey, "Content-Type": "application/json"}
    url = f"https://api.twitch.tv/kraken/streams/{streamer}"
    logger.info("Interval set for %s", streamer)

    async with aiohttp.ClientSession(headers=headers) as session:
        while True:
            await asyncio.sleep(POLL_INTERVAL_SECONDS)
            try:
                async with session.get(url) as response:
                    streamChannel = await response.json(content_type=None)
            except aiohttp.ClientError, ValueError:
                logger.exception("Twitch request for %s failed", streamer)
                continue

            # stream offline: keep polling and re-arm the message
            if not streamChannel.get("stream"):
                callFlag = True
                continue

            if callFlag:
                await chatChannel.send(f"{streamer} is currently online!")
                await chatChannel.send(streamChannel["stream"]["channel"]["url"])
                callFlag = False
