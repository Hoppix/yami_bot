from mh.mh_calculator import MhCalculator
from mh.mh_world_calculator import world_calculator


class MhCalculatorManager:
    def __init__(self) -> None:
        self.calculator: MhCalculator = world_calculator

    def set(self, calculator_definition: str) -> str:
        if calculator_definition == "world":
            self.calculator = world_calculator
        return f"Current calculator set to: {self.calculator.calculator_name}"

    def get(self) -> MhCalculator:
        return self.calculator


calculator_manager = MhCalculatorManager()
