import logging

import discord

from game.whoWroteIt.dataProvider import NotEnoughMembers
from game.whoWroteIt.game import GameError, game
from game.whoWroteIt.gameConfig import gameConfig
from game.whoWroteIt.state import wwiState
from utility import utility

logger = logging.getLogger(__name__)


class gameManager:
    ABORT_COMMAND = "abort"

    def __init__(self) -> None:
        self.games: dict[int, game] = {}

    async def delegate(self, message: discord.Message) -> None:
        if not message.guild or not isinstance(message.channel, discord.TextChannel):
            await message.reply("Must be a message from a guild text channel!")
            return

        if gameManager.ABORT_COMMAND in message.content:
            self.abortGame(message)
            return

        if message.channel.id in self.games:
            await message.reply("Game already running!")
            return

        await self.newGame(message)

    def isActive(self, message: discord.Message) -> bool:
        if not self.games:
            return False
        if not message.guild or not isinstance(message.channel, discord.TextChannel):
            return False
        return message.channel.id in self.games

    def abortGame(self, message: discord.Message) -> bool:
        channelId = message.channel.id
        current = self.games.get(channelId)

        if not current or current.state == wwiState.INITIALIZING:
            logger.warning("Cannot abort game!")
            return False

        del self.games[channelId]
        logger.info("Game aborted: %s", channelId)
        return True

    async def newGame(self, message: discord.Message) -> None:
        guild = message.guild
        if not guild or not isinstance(message.channel, discord.TextChannel):
            await message.reply("Only in guild channels allowed!")
            return

        gameMembers = await self.getGameMembersFromMessage(message, guild)
        config = gameConfig(message.channel, guild.text_channels, gameMembers)
        wwiGame = game(config)

        try:
            await wwiGame.initialize()
            await wwiGame.start()
        except GameError, NotEnoughMembers:
            logger.exception("Non recoverable error occurred, game not initialized")
            return
        self.games[wwiGame.id] = wwiGame

    async def guessForGame(self, message: discord.Message) -> None:
        channelId = message.channel.id
        currentGame = self.games.get(channelId)
        if not currentGame:
            return

        if await currentGame.guess(message):
            del self.games[channelId]

    async def getGameMembersFromMessage(self, message: discord.Message, guild: discord.Guild) -> list[discord.Member]:
        logger.info("Loading members from message: %s", message.content)

        guildMembers = [member async for member in guild.fetch_members(limit=None)]
        tokens = message.content.split(" ")[1:]  # remove command token

        gameMembers = []
        for token in tokens:
            guildMember = next(
                (
                    member
                    for member in guildMembers
                    if utility.isSameUserName(member.nick, token) or utility.isSameUserName(member.name, token)
                ),
                None,
            )
            if guildMember:
                gameMembers.append(guildMember)
            else:
                logger.warning("Could not find user for token: %s", token)

        return gameMembers


wwiGameManager = gameManager()
