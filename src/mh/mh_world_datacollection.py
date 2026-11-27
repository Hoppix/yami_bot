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
mh_bloat_map: dict[str, float] = {
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
mh_sharp_physical_map: dict[str, float] = {
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
mh_sharp_elemental_map: dict[str, float] = {
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
mh_mv_estimated_map: dict[str, int] = {
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

bow_elemental_mv = 62.625


def _load_motion_values(weapon: str) -> dict[str, list[int]]:
    path = f"MH_Data/WorldMotionvalues/mhw_{weapon}.json"
    logger.debug("Reading %s", path)
    return {move["name"]: move["hits"] for move in utility.load_resource(path)}


# motion values per move for each weapon type
mh_mv_map_map: dict[str, dict[str, list[int]]] = {weapon: _load_motion_values(weapon) for weapon in mh_mv_estimated_map}

# hitzones of the target dummies
mh_physical_dummy: dict[str, Any] = utility.load_resource("MH_Data/WorldMonsterLists/physicalDummy.json")
mh_elemental_dummy: dict[str, Any] = utility.load_resource("MH_Data/WorldMonsterLists/elementalDummy.json")
