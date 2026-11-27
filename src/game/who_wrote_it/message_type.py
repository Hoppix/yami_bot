from enum import Enum, auto


class MessageType(Enum):
    DEFAULT = auto()
    START = auto()
    FINISH = auto()
    ABORT = auto()
