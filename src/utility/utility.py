import json
import logging
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

RESOURCES_PATH = Path(__file__).resolve().parents[2] / "resources"

logger = logging.getLogger(__name__)
eventLogger = logging.getLogger("yami.events")


def loadResource(name: str) -> Any:
    """loads a json file from the resources directory"""
    with open(RESOURCES_PATH / name, encoding="utf8") as file:
        return json.load(file)


config = loadResource("config.json")


def configureLogging() -> None:
    """
    console logging for everything,
    plus the persisted event log (voice/presence/commands) in the configured logfile
    """
    logging.basicConfig(
        stream=sys.stdout,
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    logfile = Path(config["logFilePath"])
    logfile.parent.mkdir(parents=True, exist_ok=True)
    fileHandler = logging.FileHandler(logfile, encoding="utf8")
    fileHandler.setFormatter(logging.Formatter("%(asctime)s: %(message)s"))
    eventLogger.addHandler(fileHandler)


def parseDateString() -> str:
    """returns a date string in UTC"""
    return datetime.now(UTC).strftime("%a, %d %b %Y %H:%M:%S GMT")


def writeLogFile(message: str) -> None:
    """writes into the configured logfile for debugging purposes"""
    if not message:
        return
    eventLogger.info(message)


def _checkDirectory(filePath: str) -> None:
    """
    checks for a file path,
    if it does not exist it will be created with all directories
    """
    path = Path(filePath)
    path.parent.mkdir(parents=True, exist_ok=True)

    if path.exists():
        return

    defaultContent = "[]" if path.suffix == ".json" else ""
    path.write_text(defaultContent, encoding="utf8")
    logger.info("File '%s' created successfully", path)


def writeJSONFile(file: str, data: dict[str, str]) -> None:
    """writes the map as a list of [key, value] pairs (same format as the js version)"""
    _checkDirectory(file)
    content = json.dumps(list(data.items()))
    logger.info("Writing to JSON: %s with data: %s", file, content)
    Path(file).write_text(content, encoding="utf8")


def readJSONFile(file: str) -> dict[str, str]:
    """reads a list of [key, value] pairs and returns it as a dict"""
    _checkDirectory(file)
    content = Path(file).read_text(encoding="utf8")
    logger.debug("Reading from JSON: %s data: %s", file, content)
    return dict(json.loads(content))


def uptimeSince(date: datetime) -> dict[str, int]:
    """returns the passed time since date in hours, minutes, seconds"""
    diff = int((datetime.now(UTC) - date).total_seconds())
    return {
        "hours": diff // 3600,
        "minutes": (diff % 3600) // 60,
        "seconds": diff % 60,
    }


def msToTime(duration: int) -> dict[str, int]:
    """converts milliseconds into hours (mod 24), minutes, seconds"""
    return {
        "hours": (duration // (1000 * 60 * 60)) % 24,
        "minutes": (duration // (1000 * 60)) % 60,
        "seconds": (duration // 1000) % 60,
    }


def getDateFromDateString(date: str) -> datetime:
    """parses a date from a dd.mm.yyyy-hh:MM string"""
    return datetime.strptime(date, "%d.%m.%Y-%H:%M")


def isSameUserClient(userA: Any, userB: Any) -> bool:
    return userA.id == userB.id


def isSameUserName(userNameA: str | None, userNameB: str | None) -> bool:
    """
    overengineered comparison function for usernames in the johndoe#1234 schema

    no regex >:(

    its tested tho :^)
    """
    DISCORD_ID_LENGTH = 5

    if userNameA == userNameB:
        return True
    if not userNameA or not userNameB:
        return False

    userNameA = userNameA.lower()
    userNameB = userNameB.lower()

    if userNameA == userNameB:
        return True

    if "#" in userNameA and "#" not in userNameB:
        simpleUserA = userNameA[: len(userNameA) - DISCORD_ID_LENGTH]
        if simpleUserA == userNameB:
            return True

    if "#" not in userNameA and "#" in userNameB:
        simpleUserB = userNameB[: len(userNameB) - DISCORD_ID_LENGTH]
        if userNameA == simpleUserB:
            return True

    return False
