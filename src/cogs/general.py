import logging
from typing import TYPE_CHECKING

import discord
from discord import app_commands
from discord.ext import commands

from utility import utility

if TYPE_CHECKING:
    from bot import Yami

logger = logging.getLogger(__name__)

EMBED_COLOR = 900000


class General(commands.Cog):
    def __init__(self, bot: Yami) -> None:
        self.bot = bot

    @app_commands.command(description="Lists all commands")
    async def help(self, interaction: discord.Interaction) -> None:
        lines = [
            f"`/{command.qualified_name}` {command.description}"
            for command in self.bot.tree.walk_commands()
            if isinstance(command, app_commands.Command)
        ]
        embed = discord.Embed(color=EMBED_COLOR, title="Yami commands", description="\n".join(sorted(lines)))
        embed.set_footer(text="https://github.com/Hoppix/yami_bot")
        await interaction.response.send_message(embed=embed, ephemeral=True)

    @app_commands.command(description="How long Yami has been running")
    async def uptime(self, interaction: discord.Interaction) -> None:
        started = discord.utils.format_dt(self.bot.started_date, "R")
        await interaction.response.send_message(f"Yami has been running since {started}")

    @app_commands.command(description="Gives you a role, if it's not above your highest one")
    @app_commands.guild_only()
    async def giverole(self, interaction: discord.Interaction, role: discord.Role) -> None:
        member = interaction.user
        if not isinstance(member, discord.Member):
            return

        # Desired role is higher than the users role
        if role > member.top_role:
            await interaction.response.send_message("You do not have the permissions to get this role", ephemeral=True)
            return

        if member.get_role(role.id):
            await interaction.response.send_message("You already have the desired role", ephemeral=True)
            return

        try:
            await member.add_roles(role, reason="automated role")
        except discord.HTTPException:
            logger.exception("Error occurred when adding a role")
            utility.write_log_file(f"Error occurred when adding role {role.name}")
            await interaction.response.send_message(f"I am not allowed to give out {role.name}", ephemeral=True)
            return
        await interaction.response.send_message(f"{member.display_name} now has role {role.name}")
