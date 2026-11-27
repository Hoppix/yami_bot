#        ┌─────────────────────────────────────────┐
#        │                                         │
#        │                                         │
# ┌──────┴──┐          ┌──────────┐           ┌────▼───┐
# │         │          │          │           │        │
# │ Created ├───────┐  │ Guessing ├───────────► Ended  │
# │         │       │  │          │           │        │
# └─────────┘       │  └────▲─────┘           └────────┘
#                   │       │
#                   │       │
#               ┌───▼───────┴─┐
#               │             │
#               │Inizializing │
#               │             │
#               └─────────────┘

from enum import Enum, auto


class WwiState(Enum):
    CREATED = auto()
    ENDED = auto()
    GUESSING = auto()
    INITIALIZING = auto()


class IllegalStateTransition(Exception):
    def __init__(self, current: WwiState, target: WwiState) -> None:
        super().__init__(f"Illegal state transition from: {current.name} to {target.name}")


class WwiStateMachine:
    @staticmethod
    def initialize(state: WwiState) -> WwiState:
        if state != WwiState.CREATED:
            raise IllegalStateTransition(state, WwiState.INITIALIZING)
        return WwiState.INITIALIZING

    @staticmethod
    def end(state: WwiState) -> WwiState:
        if state in (WwiState.INITIALIZING, WwiState.ENDED):
            raise IllegalStateTransition(state, WwiState.ENDED)
        return WwiState.ENDED

    @staticmethod
    def start(state: WwiState) -> WwiState:
        if state != WwiState.INITIALIZING:
            raise IllegalStateTransition(state, WwiState.GUESSING)
        return WwiState.GUESSING
