from mh.mhCalculator import mhCalculator
from mh.mhWorldCalculator import worldCalculator


class mhCalculatorManager:
    def __init__(self) -> None:
        self.calculator: mhCalculator = worldCalculator

    def set(self, calculatorDefinition: str) -> str:
        if calculatorDefinition == "world":
            self.calculator = worldCalculator
        return f"Current calculator set to: {self.calculator.calculatorName}"

    def get(self) -> mhCalculator:
        return self.calculator


calculatorManager = mhCalculatorManager()
