/**
 * Created by khopf on 29/12/2017.
 *
 * This script sets all the needed data for the calculator.
 * The task is separated for scaleability
 */
import fs from "fs";
import path from "path";
import physicalDummy from "../../resources/MH_Data/WorldMonsterLists/physicalDummy.json";
import elementalDummy from "../../resources/MH_Data/WorldMonsterLists/elementalDummy.json";

export type Hitzones = Record<string, number>;

export interface Dummy {
    torso: Hitzones;
    head: Hitzones;
}

interface MotionValueEntry {
    name: string;
    hits: number[];
    count: number;
}

export const WEAPON_NAMES = ["GS", "LS", "SNS", "DS", "HM", "HH", "LC", "GL", "SA", "CB", "IG", "LBG", "HBG", "BOW"] as const;
export type WeaponName = (typeof WEAPON_NAMES)[number];

//contains the bloat value for each weapon type
export const mhBloatMap = new Map<string, number>([
    ["SNS", 1.4],
    ["DS", 1.4],
    ["GS", 4.8],
    ["LS", 3.4],
    ["HM", 5.2],
    ["HH", 4.2],
    ["LC", 2.3],
    ["GL", 2.3],
    ["SA", 3.5],
    ["CB", 3.6],
    ["IG", 3.1],
    ["BOW", 1.2],
    ["LBG", 1.3],
    ["HBG", 1.5],
]);

//contains the physical sharpness value for each weapon type
export const mhSharpPhysicalMap = new Map<string, number>([
    ["RED", 0.5],
    ["ORANGE", 0.75],
    ["YELLOW", 1.0],
    ["GREEN", 1.05],
    ["BLUE", 1.2],
    ["WHITE", 1.32],
    ["PURPLE", 1.45],
    ["GUNNER", 1],
]);

//contains the elemental sharpness value for each weapon type
export const mhSharpElementalMap = new Map<string, number>([
    ["RED", 0.25],
    ["ORANGE", 0.5],
    ["YELLOW", 0.75],
    ["GREEN", 1.0],
    ["BLUE", 1.06],
    ["WHITE", 1.12],
    ["PURPLE", 1.2],
    ["GUNNER", 1],
]);

//contains the estimated average motion value for each weapon type
export const mhMvEstimatedMap = new Map<string, number>([
    ["SNS", 16], //~average on dash and 2 hits
    ["DS", 11], //~average Ranbu!
    ["GS", 90], //Lv3 Draw Charge
    ["LS", 19], //~average in std combo
    ["HM", 48], //average on std combo
    ["HH", 24], //left-right swing
    ["LC", 25], //triple thrust
    ["GL", 24], //~triple poke
    ["SA", 33], // doublestrike, heavensflurry swordcombo, Phial missing
    ["CB", 39], //axe-combo, no phials, no shield charge
    ["IG", 17], //average std combo, red extract activated
    ["BOW", 13], //charged powershot
    ["LBG", 30], //ignored, because shot elementless
    ["HBG", 30], //ignored, because shot elementless
]);

//contains the Maps with the motionvalues per move for each weapon type
export const mhMvMapMap = new Map<string, Map<string, number[]>>();

//read data files for motion values
const MV_DIR = path.join(__dirname, "../../resources/MH_Data/WorldMotionvalues");
for (const wpnName of WEAPON_NAMES) {
    const sPath = path.join(MV_DIR, "mhw_" + wpnName + ".json");
    console.log("############ READING " + sPath + " ############");
    const mvData: MotionValueEntry[] = JSON.parse(fs.readFileSync(sPath, "utf8"));
    mhMvMapMap.set(wpnName, new Map(mvData.map((entry) => [entry.name, entry.hits])));
}

//load the hitzone json files for each Dummy
export const mhPhysicalDummy: Dummy = physicalDummy as Dummy;
export const mhElementalDummy: Dummy = elementalDummy as Dummy;
export const bowElementalMv = 62.625;
