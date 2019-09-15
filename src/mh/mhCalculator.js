/**
 * Created by khopf on 29/12/2017.
 */
const utility = require('../utility.js');
const mhDatacollection = require('./mhDatacollection.js');

//retrieve all data from mhDatacollection.js
var mhBloatMap = mhDatacollection.mhBloatMap;
var mhSharpPhysicalMap = mhDatacollection.mhSharpPhysicalMap;
var mhSharpElementalMap = mhDatacollection.mhSharpElementalMap;
var mhMvEstimatedMap = mhDatacollection.mhMvEstimatedMap;
var mhMvMapMap = mhDatacollection.mhMvMapMap;
var oElementalDummy = mhDatacollection.mhElementalDummy;

/**
 * Calculates the "true" damage for the defined weapon-values
 * How Weapon Strength is calculated:
 *
 * Since actual damage in Monster Hunter is very variable,
 * we estimate certain values to generalize parts of the calculation
 * so that the weapon itself is the deciding factor:
 * The raw weapon damage is calculated as usual,
 * then we define resistance values for a default target dummy that is an average
 * of most monster resistances.
 * Afterwards we calculate the average motion value per hit for the weapontype used.
 * This is important for the fact that in the raw weapon calculation elemental damage is a very small percentage,
 * but since we want to simulate the weapon performance as accurate as possible without setting special values for
 * target and move, we use those dummy values.
 **/
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

	//since bow has extra elemental motion values we have to check this
	let iElementalMotionValue = 100;
	if(fSharpnessPhysical === "GUNNER")
	{
		iElementalMotionValue = mhDatacollection.bowElementalMv;
	}

	var iMotionValue = mhMvEstimatedMap.get(sWeapon.toUpperCase());

	//generic purpose dummy
	var iHitzonePhysical = oElementalDummy.torso.cutting;
	var iHitzoneElemental = oElementalDummy.torso.fire;


	var fCritDamage = 1 + (iAffinity / 100) * 0.25;
	var fWeaponPhysical = fSharpnessPhysical * (iAttack / fBloat) * (iMotionValue / 100) * (iHitzonePhysical / 100);
	var fWeaponElemental = fSharpnessElemental * (iElemental / 10) * (iElementalMotionValue / 100) * (iHitzoneElemental / 100);

	return (fCritDamage * fWeaponPhysical) + fWeaponElemental;
}

/**
 * Compares two weapons and returns an object containting the better weapon and the percentual offset.
 **/
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

//export the functions which where predefined.
module.exports.mhCompareWeapons = mhCompareWeapons;
module.exports.mhCalculateWeaponStrength = mhCalculateWeaponStrength;
module.exports.mhMvMapMap = mhMvMapMap;
