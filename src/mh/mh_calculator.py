"""result type of a weapon comparison"""

from typing import TypedDict


class Comparison(TypedDict):
    weapon: str
    value: float
