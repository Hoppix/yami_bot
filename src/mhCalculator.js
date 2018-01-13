/**
 * Created by khopf on 29/12/2017.
 */
const utility = require('./utility.js');
const webscraper = require('./webscraper.js');
const mhDatacollection = require('./mhDatacollection.js');

var mhBloatMap = mhDatacollection.mhBloatMap;
var mhSharpPhysicalMap = mhDatacollection.mhSharpPhysicalMap;
var mhSharpElementalMap = mhDatacollection.mhSharpElementalMap;
var mhWeaponMvMap = mhDatacollection.mhWeaponMvMap;
var mhMvMapMap = mhDatacollection.mhMvMapMap;

function mhCalculateWeaponStrength(sSharpness, iAttack, iAffinity, iElemental, sWeapon)
{

	var fSharpnessPhysical = mhSharpPhysicalMap.get(sSharpness.toUpperCase());
	var fSharpnessElemental = mhSharpElementalMap.get(sSharpness.toUpperCase());

	if (fSharpnessPhysical === undefined)
	{
		return "Invalid Sharpness";
	}
	var fBloat = mhBloatMap.get(sWeapon.toUpperCase());
	if (fBloat === undefined)
	{
		return "Invalid Weapontype";
	}

	var iMotionValue = mhWeaponMvMap.get(sWeapon.toUpperCase());
	var iHitzonePhysical = mhMonsterMap.get("DummyI")[0][1];
	var iHitzoneElemental = mhMonsterMap.get("DummyI")[0][4];

	var fCritDamage = 1 + (iAffinity / 100) * 0.25;
	var fWeaponPhysical = fSharpnessPhysical * (iAttack / fBloat) * (iMotionValue / 100) * (iHitzonePhysical / 100);
	var fWeaponElemental = fSharpnessElemental * (iElemental / 10) * (iHitzoneElemental / 100);

	return (fCritDamage * fWeaponPhysical) + fWeaponElemental;
}

function mhCompareWeapons(sSharpness, iAttack, iAffinity, iElemental, sSharpness2, iAttack2, iAffinity2, iElemental2, sWeapon)
{
	var fWeapon1 = mhCalculateWeaponStrength(sSharpness, iAttack, iAffinity, iElemental, sWeapon);
	var fWeapon2 = mhCalculateWeaponStrength(sSharpness2, iAttack2, iAffinity2, iElemental2, sWeapon);
	if (typeof fWeapon1 === "string")
	{
		return {weapon: fWeapon1, value: 0};
	}
	if (fWeapon1 > fWeapon2)
	{
		return {weapon: "Weapon 1", value: (fWeapon1 / fWeapon2) - 1};
	}
	else
	{
		return {weapon: "Weapon 2", value: (fWeapon2 / fWeapon1) - 1};
	}

}

module.exports.mhCompareWeapons = mhCompareWeapons;
module.exports.mhCalculateWeaponStrength = mhCalculateWeaponStrength;
module.exports.mhMvMapMap = mhMvMapMap;
