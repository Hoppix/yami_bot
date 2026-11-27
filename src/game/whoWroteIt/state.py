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


class wwiState(Enum):
    CREATED = auto()
    ENDED = auto()
    GUESSING = auto()
    INITIALIZING = auto()


class IllegalStateTransition(Exception):
    def __init__(self, current: wwiState, target: wwiState) -> None:
        super().__init__(f"Illegal state transition from: {current.name} to {target.name}")


class wwiStateMachine:
    @staticmethod
    def initialize(state: wwiState) -> wwiState:
        if state != wwiState.CREATED:
            raise IllegalStateTransition(state, wwiState.INITIALIZING)
        return wwiState.INITIALIZING

    @staticmethod
    def end(state: wwiState) -> wwiState:
        if state in (wwiState.INITIALIZING, wwiState.ENDED):
            raise IllegalStateTransition(state, wwiState.ENDED)
        return wwiState.ENDED

    @staticmethod
    def start(state: wwiState) -> wwiState:
        if state != wwiState.INITIALIZING:
            raise IllegalStateTransition(state, wwiState.GUESSING)
        return wwiState.GUESSING
