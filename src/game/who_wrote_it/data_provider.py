import logging
import random

import discord

from game.who_wrote_it.game_config import GameConfig

logger = logging.getLogger(__name__)


class NotEnoughMembers(Exception):
    pass


class DataProvider:
    MIN_WORD_COUNT = 5
    UPPER_MSG_LIMIT = 4000

    def __init__(self, config: GameConfig) -> None:
        self.config = config

    async def create_game_data(self) -> list[discord.Message]:
        # todo for now only retrieve data from the main game channel, later get it from config.data_channels
        game_channel = self.config.game_channel
        game_members = self.config.members

        if len(game_members) < 2:
            error_message = f"Needs atleast 2 members but was: {len(game_members)}"
            await game_channel.send(error_message)
            raise NotEnoughMembers(error_message)

        guess_member = random.choice(game_members)

        logger.info("Loading messages from %s", game_channel.name)
        messages = [message async for message in game_channel.history(limit=DataProvider.UPPER_MSG_LIMIT)]
        logger.info("Fetched: %s", len(messages))

        return [
            message
            for message in messages
            if self.is_game_valid(message, game_members) and message.author.id == guess_member.id
        ]

    # visible for testing
    def is_game_valid(self, message: discord.Message, members: list[discord.Member]) -> bool:
        message_text = message.content

        if not self.is_from_game_member(message, members):
            logger.debug("Message not from game member, exiting ...")
            return False

        if not len(message_text.split(" ")) > DataProvider.MIN_WORD_COUNT:
            logger.debug("Message not long enough, exiting ...")
            return False

        if "https://" in message_text or "http://" in message_text:
            logger.debug("Message includes link, exiting ...")
            return False

        return True

    def is_from_game_member(self, message: discord.Message, members: list[discord.Member]) -> bool:
        author_id = message.author.id
        return len([member for member in members if member.id == author_id]) == 1
