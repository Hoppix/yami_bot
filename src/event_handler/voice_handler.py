"""handler for dispatching actions triggered by discord voice state updates"""

import logging

import discord

from utility import utility

logger = logging.getLogger(__name__)


async def handle_event_logging(
    member: discord.Member,
    old_voice_state: discord.VoiceState,
    new_voice_state: discord.VoiceState,
    default_channel: discord.TextChannel,
) -> None:
    """
    called when a user enters/leaves/switches a channel
    handles logging and sends a message to the default channel
    """
    old_channel = old_voice_state.channel
    new_channel = new_voice_state.channel
    username = member.name

    if not old_channel and new_channel:
        message = f"User: {username} joined channel: {new_channel.name}"
    elif old_channel and not new_channel:
        message = f"User: {username} left channel: {old_channel.name}"
    elif old_channel and new_channel:
        # mute/deafen etc. also trigger an update without switching channels
        if old_channel.name == new_channel.name:
            return
        message = f"User: {username} switched from: {old_channel.name} to: {new_channel.name}"
    else:
        message = "I logged an voiceStateUpdateEvent but nothing was triggered!"

    logger.info(message)
    await default_channel.send(message)
    utility.write_log_file(message)
