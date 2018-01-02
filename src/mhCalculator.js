/**
 * Created by khopf on 29/12/2017.
 */
var mhBloatMap = new Map();
var mhSharpPhysicalMap = new Map();
var mhSharpElementalMap = new Map();
var mhWeaponMvMap = new Map();
var mhGeneralTestDummy = new Map();

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

//Values for estimated average motion values
mhWeaponMvMap.set("SNS", 15); //~average
mhWeaponMvMap.set("DS", 8);  //~average
mhWeaponMvMap.set("GS", 110); //Lv3 Draw Charge
mhWeaponMvMap.set("LS", 25); //~average
mhWeaponMvMap.set("HM", 50); //average on std combo
mhWeaponMvMap.set("HH", 30); //left-right swing
mhWeaponMvMap.set("LC", 25); //triple thrust
mhWeaponMvMap.set("GL", 30); //~average
mhWeaponMvMap.set("SA", 30); // average Swordcombo, Phial missing
mhWeaponMvMap.set("CB", 44); //axe-combo, no phals, no shield charge
mhWeaponMvMap.set("IG", 20); //average std combo, red extract activated
mhWeaponMvMap.set("BOW", 0); //calculation way too different
mhWeaponMvMap.set("LBG", 0); //calculation way too different
mhWeaponMvMap.set("HBG", 0); //calculation way too different

//Test dummy for weapon Calculation
//Those numbers are an estimated average for general precision
mhGeneralTestDummy.set("PW", 60);
mhGeneralTestDummy.set("EW", 30);


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
  var iHitzonePhysical = mhGeneralTestDummy.PW;
	var iHitzoneElemental = mhGeneralTestDummy.EW;


	var fCritDamage = 1 + (iAffinity / 100) * 0.25;
	var fWeaponPhysical = fSharpnessPhysical * (iAttack / fBloat) * (iMotionValue/100);// * (iHitzonePhysical/100); //causing error
	var fWeaponElemental = fSharpnessElemental * (iElemental / 10);// * (iHitzoneElemental/100); //causing error

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
