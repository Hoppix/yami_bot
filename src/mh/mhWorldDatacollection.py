"""
Created by khopf on 29/12/2017.

This module sets all the needed data for the calculator.
The task is separated for scaleability
"""

import logging
from typing import Any

from utility import utility

logger = logging.getLogger(__name__)

# bloat value for each weapon type
mhBloatMap: dict[str, float] = {
    "SNS": 1.4,
    "DS": 1.4,
    "GS": 4.8,
    "LS": 3.4,
    "HM": 5.2,
    "HH": 4.2,
    "LC": 2.3,
    "GL": 2.3,
    "SA": 3.5,
    "CB": 3.6,
    "IG": 3.1,
    "BOW": 1.2,
    "LBG": 1.3,
    "HBG": 1.5,
}

# physical sharpness modifier
mhSharpPhysicalMap: dict[str, float] = {
    "RED": 0.5,
    "ORANGE": 0.75,
    "YELLOW": 1.0,
    "GREEN": 1.05,
    "BLUE": 1.2,
    "WHITE": 1.32,
    "PURPLE": 1.45,
    "GUNNER": 1,
}

# elemental sharpness modifier
mhSharpElementalMap: dict[str, float] = {
    "RED": 0.25,
    "ORANGE": 0.5,
    "YELLOW": 0.75,
    "GREEN": 1.0,
    "BLUE": 1.06,
    "WHITE": 1.12,
    "PURPLE": 1.2,
    "GUNNER": 1,
}

# estimated average motion value for each weapon type
mhMvEstimatedMap: dict[str, int] = {
    "SNS": 16,  # ~average on dash and 2 hits
    "DS": 11,  # ~average Ranbu!
    "GS": 90,  # Lv3 Draw Charge
    "LS": 19,  # ~average in std combo
    "HM": 48,  # average on std combo
    "HH": 24,  # left-right swing
    "LC": 25,  # triple thrust
    "GL": 24,  # ~triple poke
    "SA": 33,  # doublestrike, heavensflurry swordcombo, Phial missing
    "CB": 39,  # axe-combo, no phials, no shield charge
    "IG": 17,  # average std combo, red extract activated
    "BOW": 13,  # charged powershot
    "LBG": 30,  # ignored, because shot elementless
    "HBG": 30,  # ignored, because shot elementless
}

bowElementalMv = 62.625


def _loadMotionValues(weapon: str) -> dict[str, list[int]]:
    path = f"MH_Data/WorldMotionvalues/mhw_{weapon}.json"
    logger.debug("Reading %s", path)
    return {move["name"]: move["hits"] for move in utility.loadResource(path)}


# motion values per move for each weapon type
mhMvMapMap: dict[str, dict[str, list[int]]] = {weapon: _loadMotionValues(weapon) for weapon in mhMvEstimatedMap}

# hitzones of the target dummies
mhPhysicalDummy: dict[str, Any] = utility.loadResource("MH_Data/WorldMonsterLists/physicalDummy.json")
mhElementalDummy: dict[str, Any] = utility.loadResource("MH_Data/WorldMonsterLists/elementalDummy.json")
