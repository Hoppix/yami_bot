import { mhCalculator } from "./mhCalculator";
import { worldCalculator } from "./mhWorldCalculator";

class mhCalculatorManager {
    calculator: mhCalculator;

    constructor() {
        this.calculator = worldCalculator;
    }

    set(calculatorDefinition: string): string {
        if (calculatorDefinition === "world") {
            this.calculator = worldCalculator;
        }
        return "Current calculator set to: " + this.calculator.calculatorName;
    }

    get(): mhCalculator {
        return this.calculator;
    }
}

export default new mhCalculatorManager();
