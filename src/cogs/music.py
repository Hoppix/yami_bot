"""streaming youtube audio into a voice channel via yt-dlp and ffmpeg"""

import asyncio
import logging
from typing import Any

import discord
import yt_dlp
from discord import app_commands
from discord.ext import commands

logger = logging.getLogger(__name__)

YTDL_OPTIONS = {"format": "bestaudio/best", "noplaylist": True, "quiet": True, "default_search": "ytsearch1"}
FFMPEG_BEFORE_OPTIONS = "-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5"


def _extract_video(query: str, stream: bool) -> dict[str, Any] | None:
    """a link or a search query, the first search result wins. Only resolves the audio stream when needed"""
    options = YTDL_OPTIONS if stream else {**YTDL_OPTIONS, "extract_flat": "in_playlist"}
    with yt_dlp.YoutubeDL(options) as ytdl:
        info = ytdl.extract_info(query, download=False)
    if "entries" in info:
        entries = list(info["entries"])
        return entries[0] if entries else None
    return info


async def stop_playback(guild: discord.Guild | None) -> bool:
    if guild is None or guild.voice_client is None:
        return False
    await guild.voice_client.disconnect(force=False)
    return True


class StopView(discord.ui.View):
    def __init__(self) -> None:
        super().__init__(timeout=None)

    @discord.ui.button(label="Stop", emoji="⏹️", style=discord.ButtonStyle.secondary)
    async def stop_button(self, interaction: discord.Interaction, button: discord.ui.Button[StopView]) -> None:
        await stop_playback(interaction.guild)
        button.disabled = True
        await interaction.response.edit_message(view=self)


class Music(commands.Cog):
    @app_commands.command(description="Joins your voice channel and plays a YouTube link or search")
    @app_commands.describe(query="YouTube link or search terms")
    @app_commands.guild_only()
    async def play(self, interaction: discord.Interaction, query: str) -> None:
        member = interaction.user
        if not isinstance(member, discord.Member) or not member.voice or not member.voice.channel:
            await interaction.response.send_message("Join a voice channel first!", ephemeral=True)
            return
        target_channel = member.voice.channel

        # yt-dlp is slow and blocking, keep the event loop free
        await interaction.response.defer()
        video = await asyncio.to_thread(_extract_video, query, True)
        if video is None:
            await interaction.followup.send("Nothing found :(")
            return
        source = await discord.FFmpegOpusAudio.from_probe(
            video["url"], before_options=FFMPEG_BEFORE_OPTIONS, options="-vn"
        )

        await stop_playback(interaction.guild)
        logger.info("Playing %s in channel %s", video.get("webpage_url"), target_channel.name)
        voice_client = await target_channel.connect(self_deaf=False, self_mute=False)
        voice_client.play(source)
        await interaction.followup.send(f"🎶 Now playing: {video.get('webpage_url')}", view=StopView())

    @app_commands.command(description="Stops playback and leaves the channel")
    @app_commands.guild_only()
    async def stop(self, interaction: discord.Interaction) -> None:
        stopped = await stop_playback(interaction.guild)
        await interaction.response.send_message("Stopped" if stopped else "Nothing is playing", ephemeral=not stopped)

    @app_commands.command(description="Replies with the first matching YouTube video")
    async def youtubesearch(self, interaction: discord.Interaction, query: str) -> None:
        await interaction.response.defer()
        video = await asyncio.to_thread(_extract_video, query, False)
        if video is None:
            await interaction.followup.send("No videos found.")
            return
        await interaction.followup.send(video.get("url") or f"https://www.youtube.com/watch?v={video['id']}")
