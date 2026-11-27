"""Created by khopf on 29/12/2017."""

from typing import Any

from mh import mhWorldDatacollection
from mh.mhCalculator import Comparison


class mhWorldCalculator:
    def __init__(
        self,
        bloatMap: dict[str, float],
        mhSharpPhysicalMap: dict[str, float],
        mhSharpElementalMap: dict[str, float],
        mhMvEstimatedMap: dict[str, int],
        mhMvMapMap: dict[str, dict[str, list[int]]],
        physicalDummy: dict[str, Any],
        elementalDummy: dict[str, Any],
    ) -> None:
        self.calculatorName = "world"
        self.mhBloatMap = bloatMap
        self.mhSharpPhysicalMap = mhSharpPhysicalMap
        self.mhSharpElementalMap = mhSharpElementalMap
        self.mhMvEstimatedMap = mhMvEstimatedMap
        self.mhMvMapMap = mhMvMapMap
        self.physicalDummy = physicalDummy
        self.elementalDummy = elementalDummy

    def calculateWeaponStrength(
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

        sharpnessPhysical = self.mhSharpPhysicalMap.get(sharpness)
        sharpnessElemental = self.mhSharpElementalMap.get(sharpness)
        if sharpnessPhysical is None or sharpnessElemental is None:
            return "Invalid Sharpness"

        bloat = self.mhBloatMap.get(weapon)
        motionValue = self.mhMvEstimatedMap.get(weapon)
        if bloat is None or motionValue is None:
            return "Invalid Weapontype"

        # since bow has extra elemental motion values we have to check this
        elementalMotionValue = 100.0
        if sharpness == "GUNNER":
            elementalMotionValue = mhWorldDatacollection.bowElementalMv

        # generic purpose dummy
        hitzonePhysical = self.physicalDummy["torso"]["cutting"]
        hitzoneElemental = self.elementalDummy["torso"]["fire"]

        critDamage = 1 + (affinity / 100) * 0.25
        weaponPhysical = sharpnessPhysical * (attack / bloat) * (motionValue / 100) * (hitzonePhysical / 100)
        weaponElemental = (
            sharpnessElemental * (elemental / 10) * (elementalMotionValue / 100) * (hitzoneElemental / 100)
        )

        return (critDamage * weaponPhysical) + weaponElemental

    def compareWeaponStrength(
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
        weapon1 = self.calculateWeaponStrength(sharpness, attack, affinity, elemental, weapon)
        weapon2 = self.calculateWeaponStrength(sharpness2, attack2, affinity2, elemental2, weapon)

        if isinstance(weapon1, str):
            return {"weapon": weapon1, "value": 0}
        if isinstance(weapon2, str):
            return {"weapon": weapon2, "value": 0}

        if weapon1 > weapon2:
            return {"weapon": "Weapon 1", "value": (weapon1 / weapon2) - 1}
        return {"weapon": "Weapon 2", "value": (weapon2 / weapon1) - 1}


worldCalculator = mhWorldCalculator(
    mhWorldDatacollection.mhBloatMap,
    mhWorldDatacollection.mhSharpPhysicalMap,
    mhWorldDatacollection.mhSharpElementalMap,
    mhWorldDatacollection.mhMvEstimatedMap,
    mhWorldDatacollection.mhMvMapMap,
    mhWorldDatacollection.mhPhysicalDummy,
    mhWorldDatacollection.mhElementalDummy,
)
