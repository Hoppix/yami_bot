import { mhCalculator } from "./mhCalculator";
const oMhWorldCalculator = require("../mh/mhWorldCalculator.js");

class mhCalculatorManager {
    calculator: mhCalculator;

    constructor() {
        this.calculator = oMhWorldCalculator;
    }

    set(calculatorDefinition: string ): string{

        if (calculatorDefinition === "world") {
            this.calculator = oMhWorldCalculator;
        }
        return "Current calculator set to: " + this.calculator.calculatorName;
    }

    get(): mhCalculator {
        return this.calculator;
    }
}

module.exports = new mhCalculatorManager();