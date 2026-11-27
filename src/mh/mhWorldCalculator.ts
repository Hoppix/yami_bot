/**
 * Created by khopf on 29/12/2017.
 */
import * as mhDatacollection from "./mhWorldDatacollection";
import { Dummy } from "./mhWorldDatacollection";
import { mhCalculator, WeaponComparison } from "./mhCalculator";

class mhWorldCalculator implements mhCalculator {
    calculatorName: string;

    mhSharpPhysicalMap: Map<string, number>;
    mhBloatMap: Map<string, number>;
    mhSharpElementalMap: Map<string, number>;
    mhMvEstimatedMap: Map<string, number>;
    mhMvMapMap: Map<string, Map<string, number[]>>;

    oElementalDummy: Dummy;
    oPhysicalDummy: Dummy;

    constructor(
        mBloatMap: Map<string, number>,
        mhSharpPhysicalMap: Map<string, number>,
        mhSharpElementalMap: Map<string, number>,
        mhMvEstimatedMap: Map<string, number>,
        mhMvMapMap: Map<string, Map<string, number[]>>,
        oPhysicalDummy: Dummy,
        oElementalDummy: Dummy
    ) {
        this.calculatorName = "world";
        this.mhBloatMap = mBloatMap;
        this.mhSharpPhysicalMap = mhSharpPhysicalMap;
        this.mhSharpElementalMap = mhSharpElementalMap;
        this.mhMvEstimatedMap = mhMvEstimatedMap;
        this.mhMvMapMap = mhMvMapMap;
        this.oPhysicalDummy = oPhysicalDummy;
        this.oElementalDummy = oElementalDummy;
    }

    /**
     * Calculates the "true" damage for the defined weapon-values
     * How Weapon Strength is calculated:
     *
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
     *
     */
    calculateWeaponStrength(sSharpness: string, iAttack: number, iAffinity: number, iElemental: number, sWeapon: string): number | string {
        const fSharpnessPhysical = this.mhSharpPhysicalMap.get(sSharpness.toUpperCase());
        const fSharpnessElemental = this.mhSharpElementalMap.get(sSharpness.toUpperCase());
        if (fSharpnessPhysical === undefined || fSharpnessElemental === undefined) {
            return "Invalid Sharpness";
        }

        const fBloat = this.mhBloatMap.get(sWeapon.toUpperCase());
        const iMotionValue = this.mhMvEstimatedMap.get(sWeapon.toUpperCase());
        if (fBloat === undefined || iMotionValue === undefined) {
            return "Invalid Weapontype";
        }

        //since bow has extra elemental motion values we have to check this
        let iElementalMotionValue = 100;
        if (sSharpness === "GUNNER") {
            iElementalMotionValue = mhDatacollection.bowElementalMv;
        }

        //generic purpose dummy
        const iHitzonePhysical = this.oPhysicalDummy.torso.cutting;
        const iHitzoneElemental = this.oElementalDummy.torso.fire;

        const fCritDamage = 1 + (iAffinity / 100) * 0.25;
        const fWeaponPhysical = fSharpnessPhysical * (iAttack / fBloat) * (iMotionValue / 100) * (iHitzonePhysical / 100);
        const fWeaponElemental = fSharpnessElemental * (iElemental / 10) * (iElementalMotionValue / 100) * (iHitzoneElemental / 100);

        return fCritDamage * fWeaponPhysical + fWeaponElemental;
    }

    /**
     * Compares two weapons and returns an object containting the better weapon and the percentual offset.
     */
    compareWeaponStrength(
        sSharpness: string,
        iAttack: number,
        iAffinity: number,
        iElemental: number,
        sSharpness2: string,
        iAttack2: number,
        iAffinity2: number,
        iElemental2: number,
        sWeapon: string
    ): WeaponComparison {
        const fWeapon1 = this.calculateWeaponStrength(sSharpness, iAttack, iAffinity, iElemental, sWeapon);
        const fWeapon2 = this.calculateWeaponStrength(sSharpness2, iAttack2, iAffinity2, iElemental2, sWeapon);

        // holy shit this is ugly but it works for now :D
        if (typeof fWeapon1 === "string") {
            return { weapon: fWeapon1, value: 0 };
        }
        if (typeof fWeapon2 === "string") {
            return { weapon: fWeapon2, value: 0 };
        }
        if (fWeapon1 > fWeapon2) {
            return { weapon: "Weapon 1", value: fWeapon1 / fWeapon2 - 1 };
        }
        return { weapon: "Weapon 2", value: fWeapon2 / fWeapon1 - 1 };
    }
}

export const worldCalculator: mhCalculator = new mhWorldCalculator(
    mhDatacollection.mhBloatMap,
    mhDatacollection.mhSharpPhysicalMap,
    mhDatacollection.mhSharpElementalMap,
    mhDatacollection.mhMvEstimatedMap,
    mhDatacollection.mhMvMapMap,
    mhDatacollection.mhPhysicalDummy,
    mhDatacollection.mhElementalDummy
);
