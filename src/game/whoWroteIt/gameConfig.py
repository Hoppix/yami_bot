from dataclasses import dataclass

import discord


@dataclass
class gameConfig:
    gameChannel: discord.TextChannel
    dataChannels: list[discord.TextChannel]
    members: list[discord.Member]
