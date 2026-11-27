"""handler for dispatching actions triggered by discord message events"""

import logging
from datetime import datetime

import discord

from mh.mhCalculatorManager import calculatorManager
from requestHandler import youtubeHandler
from utility import utility

logger = logging.getLogger(__name__)

EMBED_COLOR = 900000
EMBED_FIELD_LIMIT = 25  # discord rejects embeds with more fields

commandsFile: str = utility.config["customCommandsPath"]
customCommands: dict[str, str] = {}  # dynamically generated commands


async def executeCustomCommand(command: str, message: discord.Message) -> None:
    """runs a command saved in the command map"""
    updateCommandMap()
    await message.reply(customCommands[command])


async def addCustomCommand(command: list[str], message: discord.Message) -> None:
    """adds a command to the command map"""
    if len(command) < 2:
        await message.reply("Must contain valid message!")
        return

    name = command[0]
    customCommands[name] = " ".join(command[1:]) + " "
    saveCommands()
    await message.reply(f"Command: {name} added, type: !{name}")


async def deleteCustomCommand(command: list[str], message: discord.Message) -> None:
    """delete a command from the command map, identified by the command key"""
    if not command:
        return
    customCommands.pop(command[0], None)
    saveCommands()
    await message.reply(f"Command: {command[0]} deleted!")


async def printCustomCommands(message: discord.Message) -> None:
    updateCommandMap()
    names = list(customCommands)
    embeds = []
    for start in range(0, len(names), EMBED_FIELD_LIMIT):
        embed = discord.Embed(color=EMBED_COLOR, description="Saved custom commands:")
        for name in names[start : start + EMBED_FIELD_LIMIT]:
            embed.add_field(name=name, value="##################")
        embeds.append(embed)
    await message.reply(embeds=embeds or [discord.Embed(color=EMBED_COLOR, description="No custom commands")])


def isCustomCommand(command: str) -> bool:
    """checks if command is a custom command"""
    updateCommandMap()
    return command in customCommands


def saveCommands() -> None:
    """saves the customCommands map to the persistence file"""
    utility.writeJSONFile(commandsFile, customCommands)


def updateCommandMap() -> None:
    """updates the command map from the persistence file"""
    global customCommands
    customCommands = utility.readJSONFile(commandsFile)


async def addRoleToUser(roleName: str, message: discord.Message) -> None:
    """adds a role to the user, if the user has the rights for this role"""
    guild = message.guild
    if not guild:
        await message.reply("Could not determine the server to add the role!")
        return

    guildMember = await guild.fetch_member(message.author.id)
    logger.info("search %s", roleName)

    roles = await guild.fetch_roles()
    roleDesired = next((role for role in roles if role.name.lower() == roleName.lower()), None)

    if not roleDesired:
        await message.reply("Could not find the given role")
        return

    # Desired role is higher than the users role
    if roleDesired > guildMember.top_role:
        await message.reply("You do not have the permissions to get this role")
        return

    # When the user already has the role
    if guildMember.get_role(roleDesired.id):
        await message.reply("You already have the desired role")
        return

    try:
        await guildMember.add_roles(roleDesired, reason="automated role")
    except discord.HTTPException:
        logger.exception("Error occurred when adding a role")
        utility.writeLogFile(f"Error occurred when adding role {roleDesired.name}")
        return
    await message.reply(f"{guildMember.display_name} now has role {roleDesired.name}")


async def getYoutubeSearch(command: list[str], message: discord.Message, apiKey: str) -> None:
    """
    calls the requesthandler to search with the given query for the first matching youtube-video
    and replies to the commanding user
    """
    try:
        data = await youtubeHandler.youtubeSearchRequest(command, apiKey)
    except youtubeHandler.YoutubeSearchError as error:
        await message.reply(f"Error with: {error}")
        return

    resultId = data.get("id", {})
    if resultId.get("videoId"):
        await message.reply(f"https://www.youtube.com/watch?v={resultId['videoId']}")
        return
    if resultId.get("channelId"):
        await message.reply(f"https://www.youtube.com/channel/{resultId['channelId']}")


async def printHelpMessage(message: discord.Message) -> None:
    """Responds with an embed message containing all the existing general commands"""
    embed = discord.Embed(color=EMBED_COLOR, description="@Github: https://github.com/Hoppix/yami_bot")
    embed.add_field(name="!help", value="Prints this message")
    embed.add_field(name="!play [youtubelink]", value="Plays youtube video in current voice channel")
    embed.add_field(name="!stop", value="Stops playback and leaves channel")
    embed.add_field(name="!youtubesearch [query ...]", value="replies with the first matching youtube-video")
    embed.add_field(
        name="!addcustom [commandname] [text ...]",
        value="creates a custom command which replies with the given text",
    )
    embed.add_field(name="!deletecustom [commandname]", value="Deletes a single command identified by the commandname")
    embed.add_field(name="!showcustom", value="prints all saved custom commands")
    embed.add_field(name="!uptime:", value="Prints uptime")
    embed.add_field(name="!mhhelp", value="Lists available commands for Monster Hunter Weapon calculation")
    embed.add_field(name="!giverole", value="Adds you to the given usergroup if you have the rights.")
    embed.set_footer(text="Please send known bugs to Hoppix#6723/k.hopfmann@hotmail.de")
    await message.reply(embed=embed)


async def printMhHelpMessage(message: discord.Message) -> None:
    """Responds with an embed message containing all the available monster hunter world commands"""
    embed = discord.Embed(color=EMBED_COLOR, description="Monster Hunter Calculation commands:")
    embed.add_field(
        name="!weaponstrength [sharpness] [attack] [affinity] [elemental] [weapontype]",
        value="Calculates the true weapon strength for a certain weapon",
    )
    embed.add_field(
        name=(
            "!weaponcompare [sharpness1] [attack1] [affinity1] [elemental1] "
            "[sharpness2] [attack2] [affinity2] [elemental2] [weapontype]"
        ),
        value="Calculates by how much percent a weapon outperforms the other",
    )
    embed.add_field(name="!motionvalues [weapontype]", value="Lists all the Motionvalues for every specific attack")
    embed.add_field(
        name="!kiranico [category] [object]",
        value="Generates a kiranico link from the parameters. Example: !kiranico monster, !kiranico item potion",
    )
    embed.add_field(name="!armorsets", value="link to a google spreadsheet file")
    embed.add_field(name="sharpness", value="red, orange, yellow, green, blue, white, purple, gunner")
    embed.add_field(name="attack", value="attack value as shown in game")
    embed.add_field(name="affinity", value="a number between 0 and 100")
    embed.add_field(name="elemental", value="elemental damage as shown in game (0 when none)")
    embed.add_field(name="weapontype", value="sns, ds, gs, ls, hm, hh, lc, gl, sa, cb, ig, bow, lbg, hbg")
    embed.set_footer(text="Author: Hoppix#6723, Wolf#4328")
    await message.reply(embed=embed)


async def printUptimeMessage(message: discord.Message, startedDate: datetime) -> None:
    """replies with a message containing the total uptime"""
    uptime = utility.uptimeSince(startedDate)
    await message.reply(
        f"Yami has been running for: {uptime['hours']} hours, {uptime['minutes']} minutes, "
        f"and {uptime['seconds']} seconds."
    )


def _parseNumbers(values: list[str]) -> list[float] | None:
    try:
        return [float(value) for value in values]
    except ValueError:
        return None


async def handleWeaponCalculation(command: list[str], message: discord.Message) -> None:
    """receives the message and calculates the weapon strength using the mhCalculator"""
    if len(command) != 5:
        await message.reply("Wrong Parameters!")
        return
    numbers = _parseNumbers(command[1:4])
    if numbers is None:
        await message.reply("Wrong Parameters!")
        return

    attack, affinity, elemental = numbers
    weaponStrength = calculatorManager.get().calculateWeaponStrength(
        command[0], attack, affinity, elemental, command[4]
    )

    if isinstance(weaponStrength, str):
        await message.reply(f"Weapon Strength: {weaponStrength}")
        return
    await message.reply(f"Weapon Strength: {weaponStrength:.1f}")


async def handleWeaponCompare(command: list[str], message: discord.Message) -> None:
    """receives the message and compares the weapon strength of two weapons using the mhCalculator"""
    if len(command) != 9:
        await message.reply("Wrong Parameters!")
        return
    numbers = _parseNumbers(command[1:4] + command[5:8])
    if numbers is None:
        await message.reply("Wrong Parameters!")
        return

    attack, affinity, elemental, attack2, affinity2, elemental2 = numbers
    betterWeapon = calculatorManager.get().compareWeaponStrength(
        command[0], attack, affinity, elemental, command[4], attack2, affinity2, elemental2, command[8]
    )
    await message.reply(f"{betterWeapon['weapon']} is better by {betterWeapon['value'] * 100:.1f}%")


async def getWeaponMV(command: list[str], message: discord.Message) -> None:
    """
    receives the message and responds with embeds containing all
    the motionvalues for a specified weapon using the mhCalculator
    """
    if len(command) != 1:
        await message.reply("Wrong Parameters!")
        return

    weaponKey = command[0].upper()
    weaponMV = calculatorManager.get().mhMvMapMap.get(weaponKey)

    if weaponMV is None:
        await message.reply("Invalid Weapontype!")
        return

    moves = list(weaponMV.items())
    embeds = []
    for start in range(0, len(moves), EMBED_FIELD_LIMIT):
        embed = discord.Embed(color=EMBED_COLOR, title=f"Motionvalues for {weaponKey}:")
        for name, hits in moves[start : start + EMBED_FIELD_LIMIT]:
            embed.add_field(name=name, value=",".join(str(hit) for hit in hits), inline=True)
        embeds.append(embed)
    await message.reply(embeds=embeds)


async def getKiranicoUrl(command: list[str], message: discord.Message) -> None:
    """responds with a kiranico url generated by params"""
    if len(command) > 2:
        await message.reply("0-2 parameters required.")
        return
    await message.reply("/".join(["https://mhworld.kiranico.com", *command]))


async def getArmorSpreadsheetUrl(message: discord.Message) -> None:
    """returns armor google spreadsheet"""
    await message.reply(
        "https://docs.google.com/spreadsheets/d/1lgLke5tI8LXWylHZnsmF5QTA2vdJGK6lz0N-oHm_3Ls/edit#gid=1065233840"
    )
