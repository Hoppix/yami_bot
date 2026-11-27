"""handler for streaming youtube audio into a voice channel via yt-dlp and ffmpeg"""

import asyncio
import logging

import discord
import yt_dlp

logger = logging.getLogger(__name__)

_voice_connection: discord.VoiceClient | None = None

YTDL_OPTIONS = {"format": "bestaudio/best", "noplaylist": True, "quiet": True}
FFMPEG_BEFORE_OPTIONS = "-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5"


def _extract_audio_url(link: str) -> str:
    with yt_dlp.YoutubeDL(YTDL_OPTIONS) as ytdl:
        info = ytdl.extract_info(link, download=False)
    return info["url"]


async def play_youtube_link(link: str | None, message: discord.Message) -> None:
    """bot joins the voice channel of the author and plays the youtube link"""
    global _voice_connection

    if not link:
        return
    if not isinstance(message.author, discord.Member) or not message.author.voice:
        return
    target_channel = message.author.voice.channel
    if target_channel is None:
        return

    # yt-dlp is blocking, keep the event loop free
    audio_url = await asyncio.to_thread(_extract_audio_url, link)
    source = await discord.FFmpegOpusAudio.from_probe(audio_url, before_options=FFMPEG_BEFORE_OPTIONS, options="-vn")

    await stop_youtube_link()
    logger.info("Playing youtube link: %s in channel %s", link, target_channel.name)
    _voice_connection = await target_channel.connect(self_deaf=False, self_mute=False)
    _voice_connection.play(source)


async def stop_youtube_link() -> None:
    """bot closes the voice connection"""
    global _voice_connection

    if _voice_connection is None:
        return
    await _voice_connection.disconnect()
    _voice_connection = None
