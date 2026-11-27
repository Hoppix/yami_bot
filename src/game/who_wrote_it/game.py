import logging
import random

import discord

from game.who_wrote_it.data_provider import DataProvider
from game.who_wrote_it.game_config import GameConfig
from game.who_wrote_it.moderator import Moderator
from game.who_wrote_it.state import WwiState, WwiStateMachine

logger = logging.getLogger(__name__)


class GameError(Exception):
    pass


class Game:
    def __init__(self, config: GameConfig) -> None:
        self.id = config.game_channel.id
        self.config = config
        self.state = WwiState.CREATED
        self.data_provider = DataProvider(config)
        self.messages: list[discord.Message] = []
        self.answer: discord.Message | None = None
        self.question: discord.Message | None = None

    async def initialize(self) -> Game:
        game_channel = self.config.game_channel
        if len(self.config.members) < 2:
            error_message = "Error: There were not enough valid members. Atleast 2."
            await Moderator.send_game_error_message(error_message, game_channel)
            raise GameError(error_message)

        await Moderator.send_default_game_message("Loading game data ... (this might take a while)", game_channel)
        self.state = WwiStateMachine.initialize(self.state)
        self.messages = await self.data_provider.create_game_data()
        await Moderator.send_default_game_message(
            f"Created game data with : {len(self.messages)} messages", game_channel
        )
        return self

    async def start(self, view: discord.ui.View) -> None:
        """asks the question, the view holds one guess button per member"""
        if not self.messages:
            error_message = "Error: Game was not initialized! There were no eligible messages in this channel."
            await Moderator.send_default_game_message(error_message, self.config.game_channel)
            raise GameError(error_message)

        self.answer = random.choice(self.messages)
        self.state = WwiStateMachine.start(self.state)
        self.question = await Moderator.send_default_game_message(
            f"Who wrote this message?\n '{self.answer.content}'", self.config.game_channel, view
        )

    def guess(self, member_id: int) -> bool:
        """returns True when the guess was correct, which ends the game"""
        if self.state != WwiState.GUESSING or self.answer is None:
            logger.warning("Illegal state: guessing while the game is in %s", self.state.name)
            return False

        if member_id != self.answer.author.id:
            return False

        self.state = WwiStateMachine.end(self.state)
        return True
