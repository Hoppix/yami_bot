import logging
import time
from datetime import UTC, datetime

import discord

from eventHandler import messagehandler, presencehandler, voicehandler, youtubeStreamingHandler
from game.whoWroteIt.manager import wwiGameManager
from healthcheck import server
from requestHandler import dndbeyondHandler
from utility import cacheManager, utility

utility.configureLogging()
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
startedDate = datetime.now(UTC)
startedTime = time.monotonic()

apiConfig = utility.loadResource("api_config.json")
config = utility.config

version: str = config["version"]
defaultGuildName: str = config["defaultGuildName"]
defaultGuildId = int(config["defaultGuildId"])
defaultGuildChannelId = int(config["defaultChannelId"])
defaultVoiceChannelId = int(config["defaultVoiceChannelId"])
defaultImageChannelId = int(config["defaultImageChannelId"])
playMessage: str = config["playMessage"]
commandPrefix: str = config["commandPrefix"]
startMessage = f"{version} {config['startMessage']}"

defaultChannel: discord.TextChannel | None = None
initialized = False


@client.event
async def on_ready() -> None:
    """Initiates default variables, on_ready fires again after reconnects so only once"""
    global defaultChannel, initialized
    if initialized:
        logger.info("Reconnected")
        return

    defaultGuild = client.get_guild(defaultGuildId) or await client.fetch_guild(defaultGuildId)
    logger.info("defaultGuild: %s", defaultGuild)

    if not defaultGuild.channels:
        logger.error("Guild %s has no channels!", defaultGuildName)
        return

    channel = defaultGuild.get_channel(defaultGuildChannelId)
    if not isinstance(channel, discord.TextChannel):
        logger.error("No channel with id %s found!", defaultGuildChannelId)
        return
    defaultChannel = channel
    logger.info("defaultChannel: %s", defaultChannel.name)

    defaultImageChannel = defaultGuild.get_channel(defaultImageChannelId)
    if not defaultImageChannel:
        logger.error("No channel with id %s found!", defaultImageChannelId)
        return
    logger.info("defaultImageChannel: %s", defaultImageChannel.name)

    if not defaultGuild.get_channel(defaultVoiceChannelId):
        logger.error("No VoiceChannel with id %s found!", defaultVoiceChannelId)
        return

    initialized = True

    # start dndbeyond post polling
    dndbeyondHandler.scheduleDndBeyondEvent(defaultChannel)

    # initialize persistence for custom commands
    messagehandler.updateCommandMap()

    await client.change_presence(activity=discord.Game(playMessage))

    # Start a healthcheck for curling the apps state
    await server.startHealthcheck()

    await defaultChannel.send(startMessage)

    users = cacheManager.fetchCache(client.users)
    channels = cacheManager.fetchCache(client.get_all_channels())
    guilds = cacheManager.fetchCache(client.guilds)
    logger.info("Bot has started, with %s users, in %s channels of %s guilds.", len(users), len(channels), len(guilds))

    startupTime = round((time.monotonic() - startedTime) * 1000)
    logger.info("Startup time: %sms", startupTime)


@client.event
async def on_message(message: discord.Message) -> None:
    """triggered on any message the client receives"""

    # Check for any relevant game session
    if wwiGameManager.isActive(message):
        await wwiGameManager.guessForGame(message)

    if not message.content.startswith(commandPrefix) or len(message.content) < 2:
        return

    command = message.content[1:].split(" ")
    name = command[0].lower()
    arguments = command[1:]

    match name:
        # general functions
        case "play":
            await youtubeStreamingHandler.playYoutubeLink(arguments[0] if arguments else None, message)
        case "stop":
            await youtubeStreamingHandler.stopYoutubeLink()
        case "help":
            await messagehandler.printHelpMessage(message)
        case "mhhelp":
            await messagehandler.printMhHelpMessage(message)
        case "uptime":
            await messagehandler.printUptimeMessage(message, startedDate)
        # game functions
        case "wwi":
            await wwiGameManager.delegate(message)
        # monster hunter functions
        case "weaponstrength":
            await messagehandler.handleWeaponCalculation(arguments, message)
        case "weaponcompare":
            await messagehandler.handleWeaponCompare(arguments, message)
        case "motionvalues":
            await messagehandler.getWeaponMV(arguments, message)
        case "armorsets":
            await messagehandler.getArmorSpreadsheetUrl(message)
        case "kiranico":
            await messagehandler.getKiranicoUrl(arguments, message)
        # youtube functions
        case "youtubesearch":
            await messagehandler.getYoutubeSearch(arguments, message, apiConfig["youtubeClient"])
        # custom command functions
        case "addcustom":
            await messagehandler.addCustomCommand(arguments, message)
        case "deletecustom":
            await messagehandler.deleteCustomCommand(arguments, message)
        case "showcustom":
            await messagehandler.printCustomCommands(message)
        # adding roles to user
        case "giverole":
            await messagehandler.addRoleToUser(" ".join(arguments), message)
        # get new posts from dndbeyond
        case "dndposts":
            await dndbeyondHandler.getNewPosts(message)
        case _:
            if messagehandler.isCustomCommand(command[0]):
                await messagehandler.executeCustomCommand(command[0], message)

    # command logging for error trace
    log = f"Event trigger command: <{command[0]}> at {message.created_at.strftime('%a, %d %b %Y %H:%M:%S GMT')}"
    utility.writeLogFile(log)
    logger.info(log)


@client.event
async def on_voice_state_update(
    member: discord.Member, oldVoiceState: discord.VoiceState, newVoiceState: discord.VoiceState
) -> None:
    """Event for logging voiceChannel updates"""
    if defaultChannel is None:
        return
    await voicehandler.handleEventLogging(member, oldVoiceState, newVoiceState, defaultChannel)


@client.event
async def on_presence_update(oldMember: discord.Member, newMember: discord.Member) -> None:
    """
    Event for online status etc.
    Only fires with the presences intent, which is not requested (same as the js version)
    """
    if defaultChannel is None:
        return
    # user comes online or goes offline
    if oldMember.status != newMember.status:
        await presencehandler.handleStatusUpdate(newMember, oldMember, defaultChannel)
    # user starts playing a game
    elif oldMember.activity != newMember.activity:
        await presencehandler.handleGameUpdate(newMember, oldMember, defaultChannel)


@client.event
async def on_error(event: str, *args: object, **kwargs: object) -> None:
    logger.exception("An generic error haz okuued in %s", event)
    utility.writeLogFile(f"An generic error haz okuued in {event}")


if __name__ == "__main__":
    logger.info("PreLogin")
    # log_handler=None: keep our logging configuration instead of discord.py's default
    client.run(apiConfig["token"], log_handler=None)
