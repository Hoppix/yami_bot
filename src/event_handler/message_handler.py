"""handler for dispatching actions triggered by discord message events"""

import logging
from datetime import datetime

import discord

from mh.mh_calculator_manager import calculator_manager
from request_handler import youtube_handler
from utility import utility

logger = logging.getLogger(__name__)

EMBED_COLOR = 900000
EMBED_FIELD_LIMIT = 25  # discord rejects embeds with more fields

commands_file: str = utility.config["customCommandsPath"]
custom_commands: dict[str, str] = {}  # dynamically generated commands


async def execute_custom_command(command: str, message: discord.Message) -> None:
    """runs a command saved in the command map"""
    update_command_map()
    await message.reply(custom_commands[command])


async def add_custom_command(command: list[str], message: discord.Message) -> None:
    """adds a command to the command map"""
    if len(command) < 2:
        await message.reply("Must contain valid message!")
        return

    name = command[0]
    custom_commands[name] = " ".join(command[1:]) + " "
    save_commands()
    await message.reply(f"Command: {name} added, type: !{name}")


async def delete_custom_command(command: list[str], message: discord.Message) -> None:
    """delete a command from the command map, identified by the command key"""
    if not command:
        return
    custom_commands.pop(command[0], None)
    save_commands()
    await message.reply(f"Command: {command[0]} deleted!")


async def print_custom_commands(message: discord.Message) -> None:
    update_command_map()
    names = list(custom_commands)
    embeds = []
    for start in range(0, len(names), EMBED_FIELD_LIMIT):
        embed = discord.Embed(color=EMBED_COLOR, description="Saved custom commands:")
        for name in names[start : start + EMBED_FIELD_LIMIT]:
            embed.add_field(name=name, value="##################")
        embeds.append(embed)
    await message.reply(embeds=embeds or [discord.Embed(color=EMBED_COLOR, description="No custom commands")])


def is_custom_command(command: str) -> bool:
    """checks if command is a custom command"""
    update_command_map()
    return command in custom_commands


def save_commands() -> None:
    """saves the customCommands map to the persistence file"""
    utility.write_json_file(commands_file, custom_commands)


def update_command_map() -> None:
    """updates the command map from the persistence file"""
    global custom_commands
    custom_commands = utility.read_json_file(commands_file)


async def add_role_to_user(role_name: str, message: discord.Message) -> None:
    """adds a role to the user, if the user has the rights for this role"""
    guild = message.guild
    if not guild:
        await message.reply("Could not determine the server to add the role!")
        return

    guild_member = await guild.fetch_member(message.author.id)
    logger.info("search %s", role_name)

    roles = await guild.fetch_roles()
    role_desired = next((role for role in roles if role.name.lower() == role_name.lower()), None)

    if not role_desired:
        await message.reply("Could not find the given role")
        return

    # Desired role is higher than the users role
    if role_desired > guild_member.top_role:
        await message.reply("You do not have the permissions to get this role")
        return

    # When the user already has the role
    if guild_member.get_role(role_desired.id):
        await message.reply("You already have the desired role")
        return

    try:
        await guild_member.add_roles(role_desired, reason="automated role")
    except discord.HTTPException:
        logger.exception("Error occurred when adding a role")
        utility.write_log_file(f"Error occurred when adding role {role_desired.name}")
        return
    await message.reply(f"{guild_member.display_name} now has role {role_desired.name}")


async def get_youtube_search(command: list[str], message: discord.Message, api_key: str) -> None:
    """
    calls the requesthandler to search with the given query for the first matching youtube-video
    and replies to the commanding user
    """
    try:
        data = await youtube_handler.youtube_search_request(command, api_key)
    except youtube_handler.YoutubeSearchError as error:
        await message.reply(f"Error with: {error}")
        return

    result_id = data.get("id", {})
    if result_id.get("videoId"):
        await message.reply(f"https://www.youtube.com/watch?v={result_id['videoId']}")
        return
    if result_id.get("channelId"):
        await message.reply(f"https://www.youtube.com/channel/{result_id['channelId']}")


async def print_help_message(message: discord.Message) -> None:
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


async def print_mh_help_message(message: discord.Message) -> None:
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


async def print_uptime_message(message: discord.Message, started_date: datetime) -> None:
    """replies with a message containing the total uptime"""
    uptime = utility.uptime_since(started_date)
    await message.reply(
        f"Yami has been running for: {uptime['hours']} hours, {uptime['minutes']} minutes, "
        f"and {uptime['seconds']} seconds."
    )


def _parse_numbers(values: list[str]) -> list[float] | None:
    try:
        return [float(value) for value in values]
    except ValueError:
        return None


async def handle_weapon_calculation(command: list[str], message: discord.Message) -> None:
    """receives the message and calculates the weapon strength using the calculator"""
    if len(command) != 5:
        await message.reply("Wrong Parameters!")
        return
    numbers = _parse_numbers(command[1:4])
    if numbers is None:
        await message.reply("Wrong Parameters!")
        return

    attack, affinity, elemental = numbers
    weapon_strength = calculator_manager.get().calculate_weapon_strength(
        command[0], attack, affinity, elemental, command[4]
    )

    if isinstance(weapon_strength, str):
        await message.reply(f"Weapon Strength: {weapon_strength}")
        return
    await message.reply(f"Weapon Strength: {weapon_strength:.1f}")


async def handle_weapon_compare(command: list[str], message: discord.Message) -> None:
    """receives the message and compares the weapon strength of two weapons using the calculator"""
    if len(command) != 9:
        await message.reply("Wrong Parameters!")
        return
    numbers = _parse_numbers(command[1:4] + command[5:8])
    if numbers is None:
        await message.reply("Wrong Parameters!")
        return

    attack, affinity, elemental, attack2, affinity2, elemental2 = numbers
    better_weapon = calculator_manager.get().compare_weapon_strength(
        command[0], attack, affinity, elemental, command[4], attack2, affinity2, elemental2, command[8]
    )
    await message.reply(f"{better_weapon['weapon']} is better by {better_weapon['value'] * 100:.1f}%")


async def get_weapon_mv(command: list[str], message: discord.Message) -> None:
    """
    receives the message and responds with embeds containing all
    the motionvalues for a specified weapon using the calculator
    """
    if len(command) != 1:
        await message.reply("Wrong Parameters!")
        return

    weapon_key = command[0].upper()
    weapon_mv = calculator_manager.get().mh_mv_map_map.get(weapon_key)

    if weapon_mv is None:
        await message.reply("Invalid Weapontype!")
        return

    moves = list(weapon_mv.items())
    embeds = []
    for start in range(0, len(moves), EMBED_FIELD_LIMIT):
        embed = discord.Embed(color=EMBED_COLOR, title=f"Motionvalues for {weapon_key}:")
        for name, hits in moves[start : start + EMBED_FIELD_LIMIT]:
            embed.add_field(name=name, value=",".join(str(hit) for hit in hits), inline=True)
        embeds.append(embed)
    await message.reply(embeds=embeds)


async def get_kiranico_url(command: list[str], message: discord.Message) -> None:
    """responds with a kiranico url generated by params"""
    if len(command) > 2:
        await message.reply("0-2 parameters required.")
        return
    await message.reply("/".join(["https://mhworld.kiranico.com", *command]))


async def get_armor_spreadsheet_url(message: discord.Message) -> None:
    """returns armor google spreadsheet"""
    await message.reply(
        "https://docs.google.com/spreadsheets/d/1lgLke5tI8LXWylHZnsmF5QTA2vdJGK6lz0N-oHm_3Ls/edit#gid=1065233840"
    )
