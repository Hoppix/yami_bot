import logging
from datetime import UTC, datetime

import discord

logger = logging.getLogger(__name__)


class Moderator:
    YAMI_URL = "https://github.com/Hoppix/yami_bot"
    ICON_URL = "https://puu.sh/JXUgh/a79259e7a7.png"
    YAMI_NAME = "Yami"
    GAME_COLOR = 0x5D086E
    ERROR_COLOR = 0x6E000B
    GAME_TITLE = "WhoWroteIt?"

    @staticmethod
    def _game_embed(content: str, color: int) -> discord.Embed:
        embed = discord.Embed(
            color=color,
            title=Moderator.GAME_TITLE,
            description=content,
            timestamp=datetime.now(UTC),
        )
        embed.set_author(name=Moderator.YAMI_NAME, icon_url=Moderator.ICON_URL, url=Moderator.YAMI_URL)
        embed.set_footer(text=Moderator.YAMI_NAME, icon_url=Moderator.ICON_URL)
        return embed

    @staticmethod
    async def send_default_game_message(content: str, target_channel: discord.TextChannel) -> None:
        logger.info(content)
        await target_channel.send(embed=Moderator._game_embed(content, Moderator.GAME_COLOR))

    @staticmethod
    async def send_start_game_message(
        channel: discord.TextChannel, members: list[discord.Member], target_channel: discord.TextChannel
    ) -> None:
        member_mentions = " ".join(member.mention for member in members)
        content = f"Starting game with members: {member_mentions} in channel: {channel.mention}"
        logger.info(content)
        await target_channel.send(embed=Moderator._game_embed(content, Moderator.GAME_COLOR))

    @staticmethod
    async def send_finish_game_message(
        winner: discord.Member,
        answer: discord.Message,
        channel: discord.TextChannel,
        target_channel: discord.TextChannel,
    ) -> None:
        content = (
            f"Correct! {answer.author.mention} wrote this at "
            f"{answer.created_at.strftime('%a %b %d %Y')} in {channel.mention}"
        )
        logger.info(content)
        embed = Moderator._game_embed(content, Moderator.GAME_COLOR)
        embed.add_field(name="Winner:", value=winner.mention)
        await target_channel.send(embed=embed)

    @staticmethod
    async def send_abort_game_message(target_channel: discord.TextChannel) -> None:
        content = "Game aborted!"
        logger.info(content)
        await target_channel.send(embed=Moderator._game_embed(content, Moderator.ERROR_COLOR))

    @staticmethod
    async def send_game_error_message(content: str, target_channel: discord.TextChannel) -> None:
        logger.error(content)
        await target_channel.send(embed=Moderator._game_embed(content, Moderator.ERROR_COLOR))
