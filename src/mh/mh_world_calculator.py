"""Created by khopf on 29/12/2017."""

from typing import Any

from mh import mh_world_datacollection
from mh.mh_calculator import Comparison


class MhWorldCalculator:
    def __init__(
        self,
        bloat_map: dict[str, float],
        mh_sharp_physical_map: dict[str, float],
        mh_sharp_elemental_map: dict[str, float],
        mh_mv_estimated_map: dict[str, int],
        mh_mv_map_map: dict[str, dict[str, list[int]]],
        physical_dummy: dict[str, Any],
        elemental_dummy: dict[str, Any],
    ) -> None:
        self.calculator_name = "world"
        self.mh_bloat_map = bloat_map
        self.mh_sharp_physical_map = mh_sharp_physical_map
        self.mh_sharp_elemental_map = mh_sharp_elemental_map
        self.mh_mv_estimated_map = mh_mv_estimated_map
        self.mh_mv_map_map = mh_mv_map_map
        self.physical_dummy = physical_dummy
        self.elemental_dummy = elemental_dummy

    def calculate_weapon_strength(
        self, sharpness: str, attack: float, affinity: float, elemental: float, weapon: str
    ) -> float | str:
        """
        Calculates the "true" damage for the defined weapon-values

        Since actual damage in Monster Hunter is very variable,
        we estimate certain values to generalize parts of the calculation
        so that the weapon itself is the deciding factor:
        The raw weapon damage is calculated as usual,
        then we define resistance values for a default target dummy that is an average
        of most monster resistances.
        Afterwards we calculate the average motion value per hit for the weapontype used.
        This is important for the fact that in the raw weapon calculation elemental damage is a very
        small percentage, but since we want to simulate the weapon performance as accurate as possible
        without setting special values for target and move, we use those dummy values.
        """
        sharpness = sharpness.upper()
        weapon = weapon.upper()

        sharpness_physical = self.mh_sharp_physical_map.get(sharpness)
        sharpness_elemental = self.mh_sharp_elemental_map.get(sharpness)
        if sharpness_physical is None or sharpness_elemental is None:
            return "Invalid Sharpness"

        bloat = self.mh_bloat_map.get(weapon)
        motion_value = self.mh_mv_estimated_map.get(weapon)
        if bloat is None or motion_value is None:
            return "Invalid Weapontype"

        # since bow has extra elemental motion values we have to check this
        elemental_motion_value = 100.0
        if sharpness == "GUNNER":
            elemental_motion_value = mh_world_datacollection.bow_elemental_mv

        # generic purpose dummy
        hitzone_physical = self.physical_dummy["torso"]["cutting"]
        hitzone_elemental = self.elemental_dummy["torso"]["fire"]

        crit_damage = 1 + (affinity / 100) * 0.25
        weapon_physical = sharpness_physical * (attack / bloat) * (motion_value / 100) * (hitzone_physical / 100)
        weapon_elemental = (
            sharpness_elemental * (elemental / 10) * (elemental_motion_value / 100) * (hitzone_elemental / 100)
        )

        return (crit_damage * weapon_physical) + weapon_elemental

    def compare_weapon_strength(
        self,
        sharpness: str,
        attack: float,
        affinity: float,
        elemental: float,
        sharpness2: str,
        attack2: float,
        affinity2: float,
        elemental2: float,
        weapon: str,
    ) -> Comparison:
        """Compares two weapons and returns the better weapon and the percentual offset."""
        weapon1 = self.calculate_weapon_strength(sharpness, attack, affinity, elemental, weapon)
        weapon2 = self.calculate_weapon_strength(sharpness2, attack2, affinity2, elemental2, weapon)

        if isinstance(weapon1, str):
            return {"weapon": weapon1, "value": 0}
        if isinstance(weapon2, str):
            return {"weapon": weapon2, "value": 0}

        if weapon1 > weapon2:
            return {"weapon": "Weapon 1", "value": (weapon1 / weapon2) - 1}
        return {"weapon": "Weapon 2", "value": (weapon2 / weapon1) - 1}


world_calculator = MhWorldCalculator(
    mh_world_datacollection.mh_bloat_map,
    mh_world_datacollection.mh_sharp_physical_map,
    mh_world_datacollection.mh_sharp_elemental_map,
    mh_world_datacollection.mh_mv_estimated_map,
    mh_world_datacollection.mh_mv_map_map,
    mh_world_datacollection.mh_physical_dummy,
    mh_world_datacollection.mh_elemental_dummy,
)
