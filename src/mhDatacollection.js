/**
 * Created by khopf on 29/12/2017.
 */
const utility = require('./utility.js');
const webscraper = require('./webscraper.js');

var mhBloatMap = new Map();
var mhSharpPhysicalMap = new Map();
var mhSharpElementalMap = new Map();
var mhMvEstimatedMap = new Map();

var mhMvMapMap = new Map();

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

var mhMonsterMap = new Map();

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

//Values for elemental sharpness
mhSharpElementalMap.set("RED", 0.25);
mhSharpElementalMap.set("ORANGE", 0.5);
mhSharpElementalMap.set("YELLOW", 0.75);
mhSharpElementalMap.set("GREEN", 1.0);
mhSharpElementalMap.set("BLUE", 1.06);
mhSharpElementalMap.set("WHITE", 1.12);
mhSharpElementalMap.set("PURPLE", 1.2);

//Values for estimated average motion values
mhMvEstimatedMap.set("SNS", 15); //~average
mhMvEstimatedMap.set("DS", 8);  //~average
mhMvEstimatedMap.set("GS", 110); //Lv3 Draw Charge
mhMvEstimatedMap.set("LS", 25); //~average
mhMvEstimatedMap.set("HM", 50); //average on std combo
mhMvEstimatedMap.set("HH", 30); //left-right swing
mhMvEstimatedMap.set("LC", 25); //triple thrust
mhMvEstimatedMap.set("GL", 30); //~average
mhMvEstimatedMap.set("SA", 30); // average Swordcombo, Phial missing
mhMvEstimatedMap.set("CB", 44); //axe-combo, no phals, no shield charge
mhMvEstimatedMap.set("IG", 20); //average std combo, red extract activated
mhMvEstimatedMap.set("BOW", 0); //calculation way too different
mhMvEstimatedMap.set("LBG", 0); //calculation way too different
mhMvEstimatedMap.set("HBG", 0); //calculation way too different


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
for(i = 0; i < 14; i++)
{
	var mvData = utility.readWeaponMVfile('./MH_Data/Motionvalues/mhw_' + wpnNames[i] + '.MV');
  for(j = 0; j<mvData.length; j++)
  {
  	mhMvMapMap.get(wpnNames[i]).set(mvData[j][0], mvData[j][1]);
  }
}

//load the hitzone file for each Monster in MonsterNames.MON
var monNames = utility.readMonsterNameFile('./MH_Data/MonsterNames.MON');
for(i = 0; i < monNames.length; i++)
{
	mhMonsterMap.set(monNames[i], utility.readMonsterListFile('./MH_Data/MonsterLists/' + monNames[i] + ".ML"));
}

module.exports.mhMvMapMap = mhMvMapMap;
module.exports.mhBloatMap = mhBloatMap;
module.exports.mhSharpPhysicalMap = mhSharpPhysicalMap;
module.exports.mhSharpElementalMap = mhSharpElementalMap;
module.exports.mhMvEstimatedMap = mhMvEstimatedMap;
module.exports.mhMonsterMap = mhMonsterMap;
