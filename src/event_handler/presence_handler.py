"""handler for dispatching actions triggered by discord presence updates"""

import logging

import discord

from utility import utility

logger = logging.getLogger(__name__)


async def handle_status_update(
    new_member: discord.Member, old_member: discord.Member, default_channel: discord.TextChannel
) -> None:
    """
    called when the user changes its online status.
    handles the logging and sends a message into the default channel
    """
    message = f"User {new_member.name} went {new_member.status}"

    logger.info(message)
    await default_channel.send(message)
    utility.write_log_file(message)


async def handle_game_update(
    new_member: discord.Member, old_member: discord.Member, default_channel: discord.TextChannel
) -> None:
    """
    called when the user changes its game
    handles the logging and sends a message into the default channel
    """
    if new_member.activity is None:
        return
    message = f"User {old_member.name} is now playing: {new_member.activity.name}"

    logger.info(message)
    await default_channel.send(message)
    utility.write_log_file(message)
