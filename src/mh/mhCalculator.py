"""
The generic interface for a MH calculator.
Used to differentiate between different monster hunter games since they require slightly
different calculations.
"""

from typing import Protocol, TypedDict


class Comparison(TypedDict):
    weapon: str
    value: float


class mhCalculator(Protocol):
    calculatorName: str
    mhMvMapMap: dict[str, dict[str, list[int]]]

    def calculateWeaponStrength(
        self, sharpness: str, attack: float, affinity: float, elemental: float, weapon: str
    ) -> float | str:
        """Calculates the average hit of a weapon, or returns an error message."""
        ...

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
        """compares two weapons and returns the one with the highest average hit."""
        ...
