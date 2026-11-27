import discord
from discord import app_commands
from discord.ext import commands

from game.who_wrote_it.manager import wwi_game_manager
from game.who_wrote_it.moderator import Moderator


class WhoWroteIt(commands.GroupCog, group_name="wwi", group_description="Guess who wrote an old message"):
    @app_commands.command(description="Starts a game in this channel")
    @app_commands.guild_only()
    async def start(
        self,
        interaction: discord.Interaction,
        player1: discord.Member,
        player2: discord.Member,
        player3: discord.Member | None = None,
        player4: discord.Member | None = None,
        player5: discord.Member | None = None,
        player6: discord.Member | None = None,
    ) -> None:
        channel = interaction.channel
        if interaction.guild is None or not isinstance(channel, discord.TextChannel):
            await interaction.response.send_message("Must be used in a server text channel!", ephemeral=True)
            return

        if wwi_game_manager.is_running(channel.id):
            await interaction.response.send_message("Game already running!", ephemeral=True)
            return

        # the same member picked twice only plays once
        players = [player1, player2, player3, player4, player5, player6]
        members = list({player.id: player for player in players if player is not None}.values())
        if len(members) < 2:
            await interaction.response.send_message("Needs at least 2 different players!", ephemeral=True)
            return

        await interaction.response.send_message(embed=Moderator.start_game_embed(channel, members))
        await wwi_game_manager.new_game(channel, interaction.guild, members)

    @app_commands.command(description="Stops the running game in this channel")
    async def abort(self, interaction: discord.Interaction) -> None:
        if interaction.channel is None or not await wwi_game_manager.abort_game(interaction.channel.id):
            await interaction.response.send_message("No game to abort", ephemeral=True)
            return
        await interaction.response.send_message("Aborting ...", ephemeral=True)
