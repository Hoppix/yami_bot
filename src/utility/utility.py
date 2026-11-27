import json
import logging
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from config import CONFIG

RESOURCES_PATH = Path(__file__).resolve().parents[2] / "resources"

logger = logging.getLogger(__name__)
event_logger = logging.getLogger("yami.events")


def load_resource(name: str) -> Any:
    """loads a json file from the resources directory"""
    with open(RESOURCES_PATH / name, encoding="utf8") as file:
        return json.load(file)


def configure_logging() -> None:
    """
    console logging for everything,
    plus the persisted event log (voice/presence/commands) in the configured logfile
    """
    logging.basicConfig(
        stream=sys.stdout,
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )
    logfile = Path(CONFIG.log_file_path)
    logfile.parent.mkdir(parents=True, exist_ok=True)
    file_handler = logging.FileHandler(logfile, encoding="utf8")
    file_handler.setFormatter(logging.Formatter("%(asctime)s: %(message)s"))
    event_logger.addHandler(file_handler)


def parse_date_string() -> str:
    """returns a date string in UTC"""
    return datetime.now(UTC).strftime("%a, %d %b %Y %H:%M:%S GMT")


def write_log_file(message: str) -> None:
    """writes into the configured logfile for debugging purposes"""
    if not message:
        return
    event_logger.info(message)


def _check_directory(file_path: str) -> None:
    """
    checks for a file path,
    if it does not exist it will be created with all directories
    """
    path = Path(file_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    if path.exists():
        return

    default_content = "[]" if path.suffix == ".json" else ""
    path.write_text(default_content, encoding="utf8")
    logger.info("File '%s' created successfully", path)


def write_json_file(file: str, data: dict[str, str]) -> None:
    """writes the map as a list of [key, value] pairs (same format as the js version)"""
    _check_directory(file)
    content = json.dumps(list(data.items()))
    logger.info("Writing to JSON: %s with data: %s", file, content)
    Path(file).write_text(content, encoding="utf8")


def read_json_file(file: str) -> dict[str, str]:
    """reads a list of [key, value] pairs and returns it as a dict"""
    _check_directory(file)
    content = Path(file).read_text(encoding="utf8")
    logger.debug("Reading from JSON: %s data: %s", file, content)
    return dict(json.loads(content))


def ms_to_time(duration: int) -> dict[str, int]:
    """converts milliseconds into hours (mod 24), minutes, seconds"""
    return {
        "hours": (duration // (1000 * 60 * 60)) % 24,
        "minutes": (duration // (1000 * 60)) % 60,
        "seconds": (duration // 1000) % 60,
    }


def get_date_from_date_string(date: str) -> datetime:
    """parses a date from a dd.mm.yyyy-hh:MM string"""
    return datetime.strptime(date, "%d.%m.%Y-%H:%M")


def is_same_user_client(user_a: Any, user_b: Any) -> bool:
    return user_a.id == user_b.id
