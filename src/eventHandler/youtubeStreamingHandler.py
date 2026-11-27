"""handler for streaming youtube audio into a voice channel via yt-dlp and ffmpeg"""

import asyncio
import logging

import discord
import yt_dlp

logger = logging.getLogger(__name__)

_voiceConnection: discord.VoiceClient | None = None

YTDL_OPTIONS = {"format": "bestaudio/best", "noplaylist": True, "quiet": True}
FFMPEG_BEFORE_OPTIONS = "-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5"


def _extractAudioUrl(link: str) -> str:
    with yt_dlp.YoutubeDL(YTDL_OPTIONS) as ytdl:
        info = ytdl.extract_info(link, download=False)
    return info["url"]


async def playYoutubeLink(link: str | None, message: discord.Message) -> None:
    """bot joins the voice channel of the author and plays the youtube link"""
    global _voiceConnection

    if not link:
        return
    if not isinstance(message.author, discord.Member) or not message.author.voice:
        return
    targetChannel = message.author.voice.channel
    if targetChannel is None:
        return

    # yt-dlp is blocking, keep the event loop free
    audioUrl = await asyncio.to_thread(_extractAudioUrl, link)
    source = await discord.FFmpegOpusAudio.from_probe(audioUrl, before_options=FFMPEG_BEFORE_OPTIONS, options="-vn")

    await stopYoutubeLink()
    logger.info("Playing youtube link: %s in channel %s", link, targetChannel.name)
    _voiceConnection = await targetChannel.connect(self_deaf=False, self_mute=False)
    _voiceConnection.play(source)


async def stopYoutubeLink() -> None:
    """bot closes the voice connection"""
    global _voiceConnection

    if _voiceConnection is None:
        return
    await _voiceConnection.disconnect()
    _voiceConnection = None
