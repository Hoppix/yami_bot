/**
 * Created by khopf on 29/12/2017.
 *
 * This script sets all the needed data for the calculator.
 * The task is separated for scaleability
 */


var mhBloatMap = new Map();
//contains the bloat value for each weapon type

var mhSharpPhysicalMap = new Map();
//contains the physical sharpness value for each weapon type

var mhSharpElementalMap = new Map();
//contains the elemental sharpness value for each weapon type

var mhMvEstimatedMap = new Map();
//contains the estimated average motion value for each weapon type

//contains the Maps with the motionvalues per move for each weapon type
var mhMvMapMap = new Map();

//each map contains the motion values for each move of its weapontype
var mhGSmvMap = new Map();
var mhLSmvMap = new Map();
var mhSNSmvMap = new Map();
var mhDSmvMap = new Map();
var mhHMmvMap = new Map();
var mhHHmvMap = new Map();
var mhLCmvMap = new Map();
var mhGLmvMap = new Map();
var mhSAmvMap = new Map();
var mhCBmvMap = new Map();
var mhIGmvMap = new Map();
var mhLBGmvMap = new Map();
var mhHBGmvMap = new Map();
var mhBOWmvMap = new Map();

//contains all hitzones for each target dummy
var mhDummyMap = new Map();

//Values for weapon debloating
mhBloatMap.set("SNS", 1.4);
mhBloatMap.set("DS", 1.4);
mhBloatMap.set("GS", 4.8);
mhBloatMap.set("LS", 3.4);
mhBloatMap.set("HM", 5.2);
mhBloatMap.set("HH", 4.2);
mhBloatMap.set("LC", 2.3);
mhBloatMap.set("GL", 2.3);
mhBloatMap.set("SA", 3.5);
mhBloatMap.set("CB", 3.6);
mhBloatMap.set("IG", 3.1);
mhBloatMap.set("BOW", 1.2);
mhBloatMap.set("LBG", 1.3);
mhBloatMap.set("HBG", 1.5);

//Values for physical sharpness
mhSharpPhysicalMap.set("RED", 0.5);
mhSharpPhysicalMap.set("ORANGE", 0.75);
mhSharpPhysicalMap.set("YELLOW", 1.0);
mhSharpPhysicalMap.set("GREEN", 1.05);
mhSharpPhysicalMap.set("BLUE", 1.2);
mhSharpPhysicalMap.set("WHITE", 1.32);
mhSharpPhysicalMap.set("PURPLE", 1.45);
mhSharpPhysicalMap.set("GUNNER", 1);

//Values for elemental sharpness
mhSharpElementalMap.set("RED", 0.25);
mhSharpElementalMap.set("ORANGE", 0.5);
mhSharpElementalMap.set("YELLOW", 0.75);
mhSharpElementalMap.set("GREEN", 1.0);
mhSharpElementalMap.set("BLUE", 1.06);
mhSharpElementalMap.set("WHITE", 1.12);
mhSharpElementalMap.set("PURPLE", 1.2);
mhSharpElementalMap.set("GUNNER", 1);

//Values for estimated average motion values
mhMvEstimatedMap.set("SNS", 16); //~average on dash and 2 hits
mhMvEstimatedMap.set("DS", 11); //~average Ranbu!
mhMvEstimatedMap.set("GS", 90); //Lv3 Draw Charge
mhMvEstimatedMap.set("LS", 19); //~average in std combo
mhMvEstimatedMap.set("HM", 48); //average on std combo
mhMvEstimatedMap.set("HH", 24); //left-right swing
mhMvEstimatedMap.set("LC", 25); //triple thrust
mhMvEstimatedMap.set("GL", 24); //~triple poke
mhMvEstimatedMap.set("SA", 33); // doublestrike, heavensflurry swordcombo, Phial missing
mhMvEstimatedMap.set("CB", 39); //axe-combo, no phials, no shield charge
mhMvEstimatedMap.set("IG", 17); //average std combo, red extract activated
mhMvEstimatedMap.set("BOW", 13); //charged powershot
mhMvEstimatedMap.set("LBG", 30); //ignored, because shot elementless
mhMvEstimatedMap.set("HBG", 30); //ignored, because shot elementless

//mapping MV maps to their weapon type
mhMvMapMap.set("GS", mhGSmvMap);
mhMvMapMap.set("LS", mhLSmvMap);
mhMvMapMap.set("SNS", mhSNSmvMap);
mhMvMapMap.set("DS", mhDSmvMap);
mhMvMapMap.set("HM", mhHMmvMap);
mhMvMapMap.set("HH", mhHHmvMap);
mhMvMapMap.set("LC", mhLCmvMap);
mhMvMapMap.set("GL", mhGLmvMap);
mhMvMapMap.set("SA", mhSAmvMap);
mhMvMapMap.set("CB", mhCBmvMap);
mhMvMapMap.set("IG", mhIGmvMap);
mhMvMapMap.set("LBG", mhLBGmvMap);
mhMvMapMap.set("HBG", mhHBGmvMap);
mhMvMapMap.set("BOW", mhBOWmvMap);

//read data files for motion values
var wpnNames = ["GS", "LS", "SNS", "DS", "HM", "HH", "LC", "GL", "SA", "CB", "IG", "LBG", "HBG", "BOW"];
for (let i = 0; i < 14; i++) {
    var sPath = "../../resources/MH_Data/WorldMotionvalues/mhw_" + wpnNames[i] + ".json";
    var mvData = require(sPath);
    console.log("############ READING " + sPath + " ############");
    for (let j = 0; j < mvData.length; j++) {
        mhMvMapMap.get(wpnNames[i]).set(mvData[j].name, mvData[j].hits);
    }
}

//load the hitzone json files for each Dummy
const oPhysicalDummy = require('../../resources/MH_Data/WorldMonsterLists/physicalDummy.json');
const oElementalDummy = require('../../resources/MH_Data/WorldMonsterLists/elementalDummy.json');


module.exports.mhMvMapMap = mhMvMapMap;
module.exports.mhBloatMap = mhBloatMap;
module.exports.mhSharpPhysicalMap = mhSharpPhysicalMap;
module.exports.mhSharpElementalMap = mhSharpElementalMap;
module.exports.mhMvEstimatedMap = mhMvEstimatedMap;
module.exports.mhPhysicalDummy = oPhysicalDummy;
module.exports.mhElementalDummy = oElementalDummy;
module.exports.bowElementalMv = 62.625;
