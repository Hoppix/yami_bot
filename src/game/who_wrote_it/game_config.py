from dataclasses import dataclass

import discord


@dataclass
class GameConfig:
    game_channel: discord.TextChannel
    data_channels: list[discord.TextChannel]
    members: list[discord.Member]
