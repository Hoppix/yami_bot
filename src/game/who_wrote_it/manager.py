import logging

import discord

from game.who_wrote_it.data_provider import NotEnoughMembers
from game.who_wrote_it.game import Game, GameError
from game.who_wrote_it.game_config import GameConfig
from game.who_wrote_it.guess_view import GuessView
from game.who_wrote_it.moderator import Moderator
from game.who_wrote_it.state import WwiState

logger = logging.getLogger(__name__)


class GameManager:
    def __init__(self) -> None:
        self.games: dict[int, Game] = {}
        self.views: dict[int, GuessView] = {}

    def is_running(self, channel_id: int) -> bool:
        return channel_id in self.games

    async def abort_game(self, channel_id: int) -> bool:
        current = self.games.get(channel_id)

        if not current or current.state == WwiState.INITIALIZING:
            logger.warning("Cannot abort game!")
            return False

        view = self.views.get(channel_id)
        if view is not None and current.question is not None:
            view.disable()
            await current.question.edit(view=view)
        self.end_game(current)
        logger.info("Game aborted: %s", channel_id)
        await Moderator.send_abort_game_message(current.config.game_channel)
        return True

    def end_game(self, game: Game) -> None:
        self.games.pop(game.id, None)
        self.views.pop(game.id, None)

    async def new_game(self, channel: discord.TextChannel, guild: discord.Guild, members: list[discord.Member]) -> None:
        wwi_game = Game(GameConfig(channel, guild.text_channels, members))
        # blocks a second game in this channel while loading
        self.games[wwi_game.id] = wwi_game

        try:
            await wwi_game.initialize()
            view = GuessView(wwi_game, self.end_game)
            self.views[wwi_game.id] = view
            await wwi_game.start(view)
        except GameError, NotEnoughMembers:
            logger.exception("Non recoverable error occurred, game not initialized")
            self.end_game(wwi_game)


wwi_game_manager = GameManager()
