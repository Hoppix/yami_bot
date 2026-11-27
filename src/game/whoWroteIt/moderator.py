import logging
from datetime import UTC, datetime

import discord

logger = logging.getLogger(__name__)


class moderator:
    YAMI_URL = "https://github.com/Hoppix/yami_bot"
    ICON_URL = "https://puu.sh/JXUgh/a79259e7a7.png"
    YAMI_NAME = "Yami"
    GAME_COLOR = 0x5D086E
    ERROR_COLOR = 0x6E000B
    GAME_TITLE = "WhoWroteIt?"

    @staticmethod
    def _gameEmbed(content: str, color: int) -> discord.Embed:
        embed = discord.Embed(
            color=color,
            title=moderator.GAME_TITLE,
            description=content,
            timestamp=datetime.now(UTC),
        )
        embed.set_author(name=moderator.YAMI_NAME, icon_url=moderator.ICON_URL, url=moderator.YAMI_URL)
        embed.set_footer(text=moderator.YAMI_NAME, icon_url=moderator.ICON_URL)
        return embed

    @staticmethod
    async def sendDefaultGameMessage(content: str, targetChannel: discord.TextChannel) -> None:
        logger.info(content)
        await targetChannel.send(embed=moderator._gameEmbed(content, moderator.GAME_COLOR))

    @staticmethod
    async def sendStartGameMessage(
        channel: discord.TextChannel, members: list[discord.Member], targetChannel: discord.TextChannel
    ) -> None:
        memberMentions = " ".join(member.mention for member in members)
        content = f"Starting game with members: {memberMentions} in channel: {channel.mention}"
        logger.info(content)
        await targetChannel.send(embed=moderator._gameEmbed(content, moderator.GAME_COLOR))

    @staticmethod
    async def sendFinishGameMessage(
        winner: discord.Member,
        answer: discord.Message,
        channel: discord.TextChannel,
        targetChannel: discord.TextChannel,
    ) -> None:
        content = (
            f"Correct! {answer.author.mention} wrote this at "
            f"{answer.created_at.strftime('%a %b %d %Y')} in {channel.mention}"
        )
        logger.info(content)
        embed = moderator._gameEmbed(content, moderator.GAME_COLOR)
        embed.add_field(name="Winner:", value=winner.mention)
        await targetChannel.send(embed=embed)

    @staticmethod
    async def sendAbortGameMessage(targetChannel: discord.TextChannel) -> None:
        content = "Game aborted!"
        logger.info(content)
        await targetChannel.send(embed=moderator._gameEmbed(content, moderator.ERROR_COLOR))

    @staticmethod
    async def sendGameErrorMessage(content: str, targetChannel: discord.TextChannel) -> None:
        logger.error(content)
        await targetChannel.send(embed=moderator._gameEmbed(content, moderator.ERROR_COLOR))
