"""handler for dispatching actions triggered by discord presence updates"""

import logging

import discord

from utility import utility

logger = logging.getLogger(__name__)


async def handleStatusUpdate(
    newMember: discord.Member, oldMember: discord.Member, defaultChannel: discord.TextChannel
) -> None:
    """
    called when the user changes its online status.
    handles the logging and sends a message into the defaultGuildChannel
    """
    message = f"User {newMember.name} went {newMember.status}"

    logger.info(message)
    await defaultChannel.send(message)
    utility.writeLogFile(message)


async def handleGameUpdate(
    newMember: discord.Member, oldMember: discord.Member, defaultChannel: discord.TextChannel
) -> None:
    """
    called when the user changes its game
    handles the logging and sends a message into the defaultGuildChannel
    """
    if newMember.activity is None:
        return
    message = f"User {oldMember.name} is now playing: {newMember.activity.name}"

    logger.info(message)
    await defaultChannel.send(message)
    utility.writeLogFile(message)
