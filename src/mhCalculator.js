/**
 * Created by khopf on 29/12/2017.
 */
const oUtility = require("./utility.js");

var mhBloatMap = new Map();
var mhSharpPhysicalMap = new Map();
var mhSharpElementalMap = new Map();

//Values for weapon debloating
mhBloatMap.set("SNS", 1.4);
mhBloatMap.set("DS", 1.4);
mhBloatMap.set("GS", 4.8);
mhBloatMap.set("LS", 3.3);
mhBloatMap.set("HM", 5.2);
mhBloatMap.set("HH", 5.2);
mhBloatMap.set("LC", 2.3);
mhBloatMap.set("GL", 2.3);
mhBloatMap.set("SA", 5.4);
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

function mhCalculateWeaponStrengthDummy(sSharpness, iAttack, iAffinity, iElemental, sWeapon)
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
	var fCritDamage = 1 + (iAffinity / 100) * 0.25;
	var fWeaponPhysical = fSharpnessPhysical * (iAttack / fBloat);
	var fWeaponElemental = fSharpnessElemental * (iElemental / 10);
	return oUtility.roundByDecimal(((fCritDamage * fWeaponPhysical) + fWeaponElemental), 1);
}

function mhCompareWeaponsDummy(sSharpness, iAttack, iAffinity, iElemental, sSharpness2, iAttack2, iAffinity2, iElemental2, sWeapon)
{
	var fWeapon1 = mhCalculateWeaponStrengthDummy(sSharpness, iAttack, iAffinity, iElemental, sWeapon);
	var fWeapon2 = mhCalculateWeaponStrengthDummy(sSharpness2, iAttack2, iAffinity2, iElemental2, sWeapon);
	if (typeof fWeapon1 === "string")
	{
		return fWeapon1;
	}
	if (fWeapon1 > fWeapon2)
	{
		return {weapon: "Weapon 1", value: oUtility.roundByDecimal((fWeapon1 / fWeapon2) - 1, 3)};
	}
	else
	{
		return {weapon: "Weapon 2", value: oUtility.roundByDecimal((fWeapon2 / fWeapon1) - 1, 3)};
	}

}

module.exports =
	{
		mhCalculateWeaponStrength: function (sSharpness, iAttack, iAffinity, iElemental, sWeapon)
		{
			if (typeof fWeapon1 !== "string")
			{
				return mhCalculateWeaponStrengthDummy(sSharpness, iAttack, iAffinity, iElemental, sWeapon);
			}
		},
		mhCompareWeapons: function (sSharpness, iAttack, iAffinity, iElemental, sSharpness2, iAttack2, iAffinity2, iElemental2, sWeapon)
		{
			return mhCompareWeaponsDummy(sSharpness, iAttack, iAffinity, iElemental, sSharpness2, iAttack2, iAffinity2, iElemental2, sWeapon)*100;
		}
	}