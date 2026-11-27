import logging
import random

import discord

from game.who_wrote_it.data_provider import DataProvider
from game.who_wrote_it.game_config import GameConfig
from game.who_wrote_it.moderator import Moderator
from game.who_wrote_it.state import WwiState, WwiStateMachine
from utility import utility

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

    async def initialize(self) -> Game:
        game_channel = self.config.game_channel
        if len(self.config.members) < 2:
            error_message = "Error: There were not enough valid members. Atleast 2."
            await Moderator.send_game_error_message(error_message, game_channel)
            raise GameError(error_message)

        await Moderator.send_start_game_message(game_channel, self.config.members, game_channel)
        await Moderator.send_default_game_message("Loading game data ... (this might take a while)", game_channel)
        self.state = WwiStateMachine.initialize(self.state)
        self.messages = await self.data_provider.create_game_data()
        await Moderator.send_default_game_message(
            f"Created game data with : {len(self.messages)} messages", game_channel
        )
        return self

    async def start(self) -> None:
        if not self.messages:
            error_message = "Error: Game was not initialized! There were no eligible messages in this channel."
            await Moderator.send_default_game_message(error_message, self.config.game_channel)
            raise GameError(error_message)

        self.answer = random.choice(self.messages)
        self.state = WwiStateMachine.start(self.state)
        await Moderator.send_default_game_message(
            f"Who wrote this message?\n '{self.answer.content}'", self.config.game_channel
        )

    async def guess(self, guess: discord.Message) -> bool:
        """returns True when the game ended with this guess"""
        guessed_member = guess.content
        guesser = guess.author
        guess_channel = guess.channel

        if not isinstance(guess_channel, discord.TextChannel):
            logger.warning("Illegal state: not in a text channel")
            return self.state == WwiState.ENDED

        if not isinstance(guesser, discord.Member) or self.answer is None:
            logger.warning("Illegal state: guesser or answer does not exist")
            return self.state == WwiState.ENDED

        correct_member_username = self.answer.author.name
        correct_member_nickname = getattr(self.answer.author, "nick", None)
        correct = utility.is_same_user_name(correct_member_username, guessed_member) or utility.is_same_user_name(
            correct_member_nickname, guessed_member
        )

        if correct:
            await Moderator.send_finish_game_message(guesser, self.answer, guess_channel, guess_channel)
            self.state = WwiStateMachine.end(self.state)

        return self.state == WwiState.ENDED
