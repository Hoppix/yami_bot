"""handler for dispatching actions triggered by discord voice state updates"""

import logging

import discord

from utility import utility

logger = logging.getLogger(__name__)


async def handleEventLogging(
    member: discord.Member,
    oldVoiceState: discord.VoiceState,
    newVoiceState: discord.VoiceState,
    defaultChannel: discord.TextChannel,
) -> None:
    """
    called when a user enters/leaves/switches a channel
    handles logging and sends a message to the defaultGuildChannel
    """
    oldChannel = oldVoiceState.channel
    newChannel = newVoiceState.channel
    username = member.name

    if not oldChannel and newChannel:
        message = f"User: {username} joined channel: {newChannel.name}"
    elif oldChannel and not newChannel:
        message = f"User: {username} left channel: {oldChannel.name}"
    elif oldChannel and newChannel:
        # mute/deafen etc. also trigger an update without switching channels
        if oldChannel.name == newChannel.name:
            return
        message = f"User: {username} switched from: {oldChannel.name} to: {newChannel.name}"
    else:
        message = "I logged an voiceStateUpdateEvent but nothing was triggered!"

    logger.info(message)
    await defaultChannel.send(message)
    utility.writeLogFile(message)
