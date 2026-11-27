import logging
import random

import discord

from game.whoWroteIt.dataProvider import dataProvider
from game.whoWroteIt.gameConfig import gameConfig
from game.whoWroteIt.moderator import moderator
from game.whoWroteIt.state import wwiState, wwiStateMachine
from utility import utility

logger = logging.getLogger(__name__)


class GameError(Exception):
    pass


class game:
    def __init__(self, config: gameConfig) -> None:
        self.id = config.gameChannel.id
        self.config = config
        self.state = wwiState.CREATED
        self.dataProvider = dataProvider(config)
        self.messages: list[discord.Message] = []
        self.answer: discord.Message | None = None

    async def initialize(self) -> game:
        gameChannel = self.config.gameChannel
        if len(self.config.members) < 2:
            errorMessage = "Error: There were not enough valid members. Atleast 2."
            await moderator.sendGameErrorMessage(errorMessage, gameChannel)
            raise GameError(errorMessage)

        await moderator.sendStartGameMessage(gameChannel, self.config.members, gameChannel)
        await moderator.sendDefaultGameMessage("Loading game data ... (this might take a while)", gameChannel)
        self.state = wwiStateMachine.initialize(self.state)
        self.messages = await self.dataProvider.createGameData()
        await moderator.sendDefaultGameMessage(f"Created game data with : {len(self.messages)} messages", gameChannel)
        return self

    async def start(self) -> None:
        if not self.messages:
            errorMessage = "Error: Game was not initialized! There were no eligible messages in this channel."
            await moderator.sendDefaultGameMessage(errorMessage, self.config.gameChannel)
            raise GameError(errorMessage)

        self.answer = random.choice(self.messages)
        self.state = wwiStateMachine.start(self.state)
        await moderator.sendDefaultGameMessage(
            f"Who wrote this message?\n '{self.answer.content}'", self.config.gameChannel
        )

    async def guess(self, guess: discord.Message) -> bool:
        """returns True when the game ended with this guess"""
        guessedMember = guess.content
        guesser = guess.author
        guessChannel = guess.channel

        if not isinstance(guessChannel, discord.TextChannel):
            logger.warning("Illegal state: not in a text channel")
            return self.state == wwiState.ENDED

        if not isinstance(guesser, discord.Member) or self.answer is None:
            logger.warning("Illegal state: guesser or answer does not exist")
            return self.state == wwiState.ENDED

        correctMemberUsername = self.answer.author.name
        correctMemberNickname = getattr(self.answer.author, "nick", None)
        correct = utility.isSameUserName(correctMemberUsername, guessedMember) or utility.isSameUserName(
            correctMemberNickname, guessedMember
        )

        if correct:
            await moderator.sendFinishGameMessage(guesser, self.answer, guessChannel, guessChannel)
            self.state = wwiStateMachine.end(self.state)

        return self.state == wwiState.ENDED
