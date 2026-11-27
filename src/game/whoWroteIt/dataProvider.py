import logging
import random

import discord

from game.whoWroteIt.gameConfig import gameConfig

logger = logging.getLogger(__name__)


class NotEnoughMembers(Exception):
    pass


class dataProvider:
    MIN_WORD_COUNT = 5
    UPPER_MSG_LIMIT = 4000

    def __init__(self, config: gameConfig) -> None:
        self.config = config

    async def createGameData(self) -> list[discord.Message]:
        # todo for now only retrieve data from the main game channel, later get it from config.dataChannels
        gameChannel = self.config.gameChannel
        gameMembers = self.config.members

        if len(gameMembers) < 2:
            errorMessage = f"Needs atleast 2 members but was: {len(gameMembers)}"
            await gameChannel.send(errorMessage)
            raise NotEnoughMembers(errorMessage)

        guessMember = random.choice(gameMembers)

        logger.info("Loading messages from %s", gameChannel.name)
        messages = [message async for message in gameChannel.history(limit=dataProvider.UPPER_MSG_LIMIT)]
        logger.info("Fetched: %s", len(messages))

        return [
            message
            for message in messages
            if self.isGameValid(message, gameMembers) and message.author.id == guessMember.id
        ]

    # visible for testing
    def isGameValid(self, message: discord.Message, members: list[discord.Member]) -> bool:
        messageText = message.content

        if not self.isFromGameMember(message, members):
            logger.debug("Message not from game member, exiting ...")
            return False

        if not len(messageText.split(" ")) > dataProvider.MIN_WORD_COUNT:
            logger.debug("Message not long enough, exiting ...")
            return False

        if "https://" in messageText or "http://" in messageText:
            logger.debug("Message includes link, exiting ...")
            return False

        return True

    def isFromGameMember(self, message: discord.Message, members: list[discord.Member]) -> bool:
        authorId = message.author.id
        return len([member for member in members if member.id == authorId]) == 1
