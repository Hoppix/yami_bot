import discord
from discord import app_commands
from discord.ext import commands

from mh import mh_world_datacollection
from mh.mh_world_calculator import world_calculator

EMBED_COLOR = 900000
EMBED_FIELD_LIMIT = 25  # discord rejects embeds with more fields
ARMOR_SPREADSHEET_URL = (
    "https://docs.google.com/spreadsheets/d/1lgLke5tI8LXWylHZnsmF5QTA2vdJGK6lz0N-oHm_3Ls/edit#gid=1065233840"
)

weapon_choices = [app_commands.Choice(name=weapon, value=weapon) for weapon in mh_world_datacollection.mh_bloat_map]
sharpness_choices = [
    app_commands.Choice(name=sharpness.lower(), value=sharpness)
    for sharpness in mh_world_datacollection.mh_sharp_physical_map
]
Attack = app_commands.Range[int, 0]
Affinity = app_commands.Range[int, -100, 100]
Element = app_commands.Range[int, 0]


class MonsterHunter(commands.GroupCog, group_name="mh", group_description="Monster Hunter World calculations"):
    @app_commands.command(description="Average damage per hit against a generic target")
    @app_commands.describe(attack="as shown in game", element="as shown in game, 0 when none")
    @app_commands.choices(sharpness=sharpness_choices, weapon=weapon_choices)
    async def weaponstrength(
        self,
        interaction: discord.Interaction,
        weapon: str,
        sharpness: str,
        attack: Attack,
        affinity: Affinity,
        element: Element,
    ) -> None:
        strength = world_calculator.calculate_weapon_strength(sharpness, attack, affinity, element, weapon)
        await interaction.response.send_message(f"Weapon Strength: {strength:.1f}")

    @app_commands.command(description="Which weapon is better, and by how much")
    @app_commands.choices(sharpness1=sharpness_choices, sharpness2=sharpness_choices, weapon=weapon_choices)
    async def weaponcompare(
        self,
        interaction: discord.Interaction,
        weapon: str,
        sharpness1: str,
        attack1: Attack,
        affinity1: Affinity,
        element1: Element,
        sharpness2: str,
        attack2: Attack,
        affinity2: Affinity,
        element2: Element,
    ) -> None:
        better_weapon = world_calculator.compare_weapon_strength(
            sharpness1, attack1, affinity1, element1, sharpness2, attack2, affinity2, element2, weapon
        )
        await interaction.response.send_message(
            f"{better_weapon['weapon']} is better by {better_weapon['value'] * 100:.1f}%"
        )

    @app_commands.command(description="Motion values for every attack of a weapon type")
    @app_commands.choices(weapon=weapon_choices)
    async def motionvalues(self, interaction: discord.Interaction, weapon: str) -> None:
        moves = list(world_calculator.mh_mv_map_map[weapon].items())
        embeds = []
        for start in range(0, len(moves), EMBED_FIELD_LIMIT):
            embed = discord.Embed(color=EMBED_COLOR, title=f"Motionvalues for {weapon}:")
            for name, hits in moves[start : start + EMBED_FIELD_LIMIT]:
                embed.add_field(name=name, value=",".join(str(hit) for hit in hits), inline=True)
            embeds.append(embed)
        await interaction.response.send_message(embeds=embeds)

    @app_commands.command(description="Link to Kiranico, for example: monster, or item potion")
    async def kiranico(self, interaction: discord.Interaction, category: str = "", name: str = "") -> None:
        parts = [part for part in (category, name) if part]
        await interaction.response.send_message("/".join(["https://mhworld.kiranico.com", *parts]))

    @app_commands.command(description="Link to the armor set spreadsheet")
    async def armorsets(self, interaction: discord.Interaction) -> None:
        await interaction.response.send_message(ARMOR_SPREADSHEET_URL)
