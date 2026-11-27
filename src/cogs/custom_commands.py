import discord
from discord import app_commands
from discord.ext import commands

from config import CONFIG
from utility import utility

EMBED_COLOR = 900000
EMBED_FIELD_LIMIT = 25  # discord rejects embeds with more fields
AUTOCOMPLETE_LIMIT = 25  # discord shows at most 25 suggestions

commands_file = CONFIG.custom_commands_path


class CustomCommands(commands.GroupCog, group_name="custom", group_description="Commands anyone can create"):
    def __init__(self) -> None:
        self.custom_commands: dict[str, str] = utility.read_json_file(commands_file)

    def save_commands(self) -> None:
        utility.write_json_file(commands_file, self.custom_commands)

    async def name_autocomplete(self, interaction: discord.Interaction, current: str) -> list[app_commands.Choice[str]]:
        names = [name for name in self.custom_commands if current.lower() in name.lower()]
        return [app_commands.Choice(name=name, value=name) for name in names[:AUTOCOMPLETE_LIMIT]]

    @app_commands.command(description="Runs a custom command")
    @app_commands.autocomplete(name=name_autocomplete)
    async def run(self, interaction: discord.Interaction, name: str) -> None:
        text = self.custom_commands.get(name)
        if text is None:
            await interaction.response.send_message(f"There is no command {name}", ephemeral=True)
            return
        await interaction.response.send_message(text)

    @app_commands.command(description="Creates a custom command which replies with the text")
    async def add(self, interaction: discord.Interaction, name: str, text: str) -> None:
        self.custom_commands[name] = text
        self.save_commands()
        await interaction.response.send_message(f"Command: {name} added, type: /custom run {name}")

    @app_commands.command(description="Deletes a custom command")
    @app_commands.autocomplete(name=name_autocomplete)
    async def delete(self, interaction: discord.Interaction, name: str) -> None:
        if self.custom_commands.pop(name, None) is None:
            await interaction.response.send_message(f"There is no command {name}", ephemeral=True)
            return
        self.save_commands()
        await interaction.response.send_message(f"Command: {name} deleted!")

    @app_commands.command(name="list", description="Lists all custom commands")
    async def list_commands(self, interaction: discord.Interaction) -> None:
        names = list(self.custom_commands)
        embeds = []
        for start in range(0, len(names), EMBED_FIELD_LIMIT):
            embed = discord.Embed(color=EMBED_COLOR, description="Saved custom commands:")
            for name in names[start : start + EMBED_FIELD_LIMIT]:
                embed.add_field(name=name, value="##################")
            embeds.append(embed)
        # a message holds at most 10 embeds
        await interaction.response.send_message(
            embeds=embeds[:10] or [discord.Embed(color=EMBED_COLOR, description="No custom commands")]
        )
