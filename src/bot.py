import logging
import time
from datetime import UTC, datetime
from importlib.metadata import version as package_version

import discord
from discord import app_commands
from discord.ext import commands

from cogs.custom_commands import CustomCommands
from cogs.dndbeyond import DndBeyond
from cogs.general import General
from cogs.monster_hunter import MonsterHunter
from cogs.music import Music
from cogs.who_wrote_it import WhoWroteIt
from event_handler import voice_handler
from healthcheck import server
from utility import utility

utility.configure_logging()
logger = logging.getLogger("yami")

api_config = utility.load_resource("api_config.json")
config = utility.config

version = package_version("yami-bot")
default_guild = discord.Object(id=int(config["defaultGuildId"]))
default_guild_channel_id = int(config["defaultChannelId"])
play_message: str = config["playMessage"]
start_message = f"v{version} {config['startMessage']}"


class Yami(commands.Bot):
    def __init__(self) -> None:
        intents = discord.Intents.none()
        intents.guilds = True
        intents.voice_states = True
        intents.message_content = True  # WhoWroteIt reads the content of old messages
        super().__init__(
            command_prefix=commands.when_mentioned,
            intents=intents,
            activity=discord.Game(play_message),
        )
        self.started_date = datetime.now(UTC)
        self.started_time = time.monotonic()
        self.default_channel: discord.TextChannel | None = None

    async def setup_hook(self) -> None:
        """runs once before connecting, unlike on_ready which fires again after reconnects"""
        for cog in (General(self), Music(), CustomCommands(), MonsterHunter(), WhoWroteIt(), DndBeyond(self)):
            await self.add_cog(cog)
        self.tree.on_error = on_app_command_error

        await server.start_healthcheck(self)
        self.loop.create_task(self.sync_commands())
        self.loop.create_task(self.announce_start())

    async def sync_commands(self) -> None:
        """in the background, because discord rate limits syncs and startup should not wait for that"""
        # guild commands show up instantly, global ones can take an hour
        self.tree.copy_global_to(guild=default_guild)
        try:
            synced = await self.tree.sync(guild=default_guild)
            logger.info("Synced %s commands", len(synced))
        except discord.HTTPException:
            logger.exception("Could not sync commands, is the bot invited with the applications.commands scope?")

    async def announce_start(self) -> None:
        await self.wait_until_ready()
        channel = self.get_channel(default_guild_channel_id)
        if not isinstance(channel, discord.TextChannel):
            logger.error("No channel with id %s found!", default_guild_channel_id)
            return
        self.default_channel = channel
        logger.info("defaultChannel: %s", channel.name)

        await channel.send(start_message)
        logger.info("Bot has started, with %s users in %s guilds.", len(self.users), len(self.guilds))
        logger.info("Startup time: %sms", round((time.monotonic() - self.started_time) * 1000))

    async def on_voice_state_update(
        self, member: discord.Member, old_voice_state: discord.VoiceState, new_voice_state: discord.VoiceState
    ) -> None:
        """Event for logging voiceChannel updates"""
        if self.default_channel is None:
            return
        await voice_handler.handle_event_logging(member, old_voice_state, new_voice_state, self.default_channel)

    async def on_app_command_completion(
        self, interaction: discord.Interaction, command: app_commands.Command | app_commands.ContextMenu
    ) -> None:
        """command logging for error trace"""
        log = f"Event trigger command: </{command.qualified_name}> by {interaction.user.name}"
        utility.write_log_file(log)
        logger.info(log)

    async def on_error(self, event: str, *args: object, **kwargs: object) -> None:
        logger.exception("An generic error haz okuued in %s", event)
        utility.write_log_file(f"An generic error haz okuued in {event}")


async def on_app_command_error(interaction: discord.Interaction, error: app_commands.AppCommandError) -> None:
    command = interaction.command.name if interaction.command else "unknown"
    logger.error("Error in command /%s", command, exc_info=error)
    utility.write_log_file(f"Error in command /{command}: {error}")

    message = "Something went wrong :("
    if interaction.response.is_done():
        await interaction.followup.send(message, ephemeral=True)
    else:
        await interaction.response.send_message(message, ephemeral=True)


if __name__ == "__main__":
    logger.info("PreLogin")
    # log_handler=None: keep our logging configuration instead of discord.py's default
    Yami().run(api_config["token"], log_handler=None)
