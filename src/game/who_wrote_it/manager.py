import logging

import discord

from game.who_wrote_it.data_provider import NotEnoughMembers
from game.who_wrote_it.game import Game, GameError
from game.who_wrote_it.game_config import GameConfig
from game.who_wrote_it.state import WwiState
from utility import utility

logger = logging.getLogger(__name__)


class GameManager:
    ABORT_COMMAND = "abort"

    def __init__(self) -> None:
        self.games: dict[int, Game] = {}

    async def delegate(self, message: discord.Message) -> None:
        if not message.guild or not isinstance(message.channel, discord.TextChannel):
            await message.reply("Must be a message from a guild text channel!")
            return

        if GameManager.ABORT_COMMAND in message.content:
            self.abort_game(message)
            return

        if message.channel.id in self.games:
            await message.reply("Game already running!")
            return

        await self.new_game(message)

    def is_active(self, message: discord.Message) -> bool:
        if not self.games:
            return False
        if not message.guild or not isinstance(message.channel, discord.TextChannel):
            return False
        return message.channel.id in self.games

    def abort_game(self, message: discord.Message) -> bool:
        channel_id = message.channel.id
        current = self.games.get(channel_id)

        if not current or current.state == WwiState.INITIALIZING:
            logger.warning("Cannot abort game!")
            return False

        del self.games[channel_id]
        logger.info("Game aborted: %s", channel_id)
        return True

    async def new_game(self, message: discord.Message) -> None:
        guild = message.guild
        if not guild or not isinstance(message.channel, discord.TextChannel):
            await message.reply("Only in guild channels allowed!")
            return

        game_members = await self.get_game_members_from_message(message, guild)
        config = GameConfig(message.channel, guild.text_channels, game_members)
        wwi_game = Game(config)

        try:
            await wwi_game.initialize()
            await wwi_game.start()
        except GameError, NotEnoughMembers:
            logger.exception("Non recoverable error occurred, game not initialized")
            return
        self.games[wwi_game.id] = wwi_game

    async def guess_for_game(self, message: discord.Message) -> None:
        channel_id = message.channel.id
        current_game = self.games.get(channel_id)
        if not current_game:
            return

        if await current_game.guess(message):
            del self.games[channel_id]

    async def get_game_members_from_message(
        self, message: discord.Message, guild: discord.Guild
    ) -> list[discord.Member]:
        logger.info("Loading members from message: %s", message.content)

        guild_members = [member async for member in guild.fetch_members(limit=None)]
        tokens = message.content.split(" ")[1:]  # remove command token

        game_members = []
        for token in tokens:
            guild_member = next(
                (
                    member
                    for member in guild_members
                    if utility.is_same_user_name(member.nick, token) or utility.is_same_user_name(member.name, token)
                ),
                None,
            )
            if guild_member:
                game_members.append(guild_member)
            else:
                logger.warning("Could not find user for token: %s", token)

        return game_members


wwi_game_manager = GameManager()
