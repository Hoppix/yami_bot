/**
 * The generic interface for a MH calculator.
 * Used to differentiate between different monster hunter games since they require slitg
 * different calculations.
 */
export interface mhCalculator {

    calculatorName: string;

    /**
     * Calculates the average hit of a weapon.
     */
    calculateWeaponStrength(
        sSharpness: string,
        iAttack: number,
        iAffinity: number,
        iElemental: number,
        sWeapon: string
    ): any;

    /**
     * compares two weapons and returns the one with the highest average hit.
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
    ): object;
}


