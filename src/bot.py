import logging
import time
from datetime import UTC, datetime

import discord

from event_handler import message_handler, presence_handler, voice_handler, youtube_streaming_handler
from game.who_wrote_it.manager import wwi_game_manager
from healthcheck import server
from request_handler import dndbeyond_handler
from utility import cache_manager, utility

utility.configure_logging()
logger = logging.getLogger("yami")

intents = discord.Intents.none()
intents.guilds = True
intents.guild_messages = True
intents.message_content = True
intents.members = True
intents.voice_states = True
intents.emojis_and_stickers = True
intents.guild_typing = True
intents.dm_reactions = True
intents.dm_typing = True
client = discord.Client(intents=intents)

# starting date for checking uptime
started_date = datetime.now(UTC)
started_time = time.monotonic()

api_config = utility.load_resource("api_config.json")
config = utility.config

version: str = config["version"]
default_guild_name: str = config["defaultGuildName"]
default_guild_id = int(config["defaultGuildId"])
default_guild_channel_id = int(config["defaultChannelId"])
default_voice_channel_id = int(config["defaultVoiceChannelId"])
default_image_channel_id = int(config["defaultImageChannelId"])
play_message: str = config["playMessage"]
command_prefix: str = config["commandPrefix"]
start_message = f"{version} {config['startMessage']}"

default_channel: discord.TextChannel | None = None
initialized = False


@client.event
async def on_ready() -> None:
    """Initiates default variables, on_ready fires again after reconnects so only once"""
    global default_channel, initialized
    if initialized:
        logger.info("Reconnected")
        return

    default_guild = client.get_guild(default_guild_id) or await client.fetch_guild(default_guild_id)
    logger.info("defaultGuild: %s", default_guild)

    if not default_guild.channels:
        logger.error("Guild %s has no channels!", default_guild_name)
        return

    channel = default_guild.get_channel(default_guild_channel_id)
    if not isinstance(channel, discord.TextChannel):
        logger.error("No channel with id %s found!", default_guild_channel_id)
        return
    default_channel = channel
    logger.info("defaultChannel: %s", default_channel.name)

    default_image_channel = default_guild.get_channel(default_image_channel_id)
    if not default_image_channel:
        logger.error("No channel with id %s found!", default_image_channel_id)
        return
    logger.info("defaultImageChannel: %s", default_image_channel.name)

    if not default_guild.get_channel(default_voice_channel_id):
        logger.error("No VoiceChannel with id %s found!", default_voice_channel_id)
        return

    initialized = True

    # start dndbeyond post polling
    dndbeyond_handler.schedule_dnd_beyond_event(default_channel)

    # initialize persistence for custom commands
    message_handler.update_command_map()

    await client.change_presence(activity=discord.Game(play_message))

    # Start a healthcheck for curling the apps state
    await server.start_healthcheck()

    await default_channel.send(start_message)

    users = cache_manager.fetch_cache(client.users)
    channels = cache_manager.fetch_cache(client.get_all_channels())
    guilds = cache_manager.fetch_cache(client.guilds)
    logger.info("Bot has started, with %s users, in %s channels of %s guilds.", len(users), len(channels), len(guilds))

    startup_time = round((time.monotonic() - started_time) * 1000)
    logger.info("Startup time: %sms", startup_time)


@client.event
async def on_message(message: discord.Message) -> None:
    """triggered on any message the client receives"""

    # Check for any relevant game session
    if wwi_game_manager.is_active(message):
        await wwi_game_manager.guess_for_game(message)

    if not message.content.startswith(command_prefix) or len(message.content) < 2:
        return

    command = message.content[1:].split(" ")
    name = command[0].lower()
    arguments = command[1:]

    match name:
        # general functions
        case "play":
            await youtube_streaming_handler.play_youtube_link(arguments[0] if arguments else None, message)
        case "stop":
            await youtube_streaming_handler.stop_youtube_link()
        case "help":
            await message_handler.print_help_message(message)
        case "mhhelp":
            await message_handler.print_mh_help_message(message)
        case "uptime":
            await message_handler.print_uptime_message(message, started_date)
        # game functions
        case "wwi":
            await wwi_game_manager.delegate(message)
        # monster hunter functions
        case "weaponstrength":
            await message_handler.handle_weapon_calculation(arguments, message)
        case "weaponcompare":
            await message_handler.handle_weapon_compare(arguments, message)
        case "motionvalues":
            await message_handler.get_weapon_mv(arguments, message)
        case "armorsets":
            await message_handler.get_armor_spreadsheet_url(message)
        case "kiranico":
            await message_handler.get_kiranico_url(arguments, message)
        # youtube functions
        case "youtubesearch":
            await message_handler.get_youtube_search(arguments, message, api_config["youtubeClient"])
        # custom command functions
        case "addcustom":
            await message_handler.add_custom_command(arguments, message)
        case "deletecustom":
            await message_handler.delete_custom_command(arguments, message)
        case "showcustom":
            await message_handler.print_custom_commands(message)
        # adding roles to user
        case "giverole":
            await message_handler.add_role_to_user(" ".join(arguments), message)
        # get new posts from dndbeyond
        case "dndposts":
            await dndbeyond_handler.get_new_posts(message)
        case _:
            if message_handler.is_custom_command(command[0]):
                await message_handler.execute_custom_command(command[0], message)

    # command logging for error trace
    log = f"Event trigger command: <{command[0]}> at {message.created_at.strftime('%a, %d %b %Y %H:%M:%S GMT')}"
    utility.write_log_file(log)
    logger.info(log)


@client.event
async def on_voice_state_update(
    member: discord.Member, old_voice_state: discord.VoiceState, new_voice_state: discord.VoiceState
) -> None:
    """Event for logging voiceChannel updates"""
    if default_channel is None:
        return
    await voice_handler.handle_event_logging(member, old_voice_state, new_voice_state, default_channel)


@client.event
async def on_presence_update(old_member: discord.Member, new_member: discord.Member) -> None:
    """
    Event for online status etc.
    Only fires with the presences intent, which is not requested (same as the js version)
    """
    if default_channel is None:
        return
    # user comes online or goes offline
    if old_member.status != new_member.status:
        await presence_handler.handle_status_update(new_member, old_member, default_channel)
    # user starts playing a game
    elif old_member.activity != new_member.activity:
        await presence_handler.handle_game_update(new_member, old_member, default_channel)


@client.event
async def on_error(event: str, *args: object, **kwargs: object) -> None:
    logger.exception("An generic error haz okuued in %s", event)
    utility.write_log_file(f"An generic error haz okuued in {event}")


if __name__ == "__main__":
    logger.info("PreLogin")
    # log_handler=None: keep our logging configuration instead of discord.py's default
    client.run(api_config["token"], log_handler=None)
