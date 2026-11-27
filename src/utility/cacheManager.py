import logging
from collections.abc import Iterable
from typing import Any

logger = logging.getLogger(__name__)


def fetchCache(entities: Iterable[Any] | None) -> list[Any]:
    """Helper function to load all cached entities of a particular kind"""
    logger.info("Fetching cache ...")
    if entities is None:
        return []

    result = []
    for entity in entities:
        logger.debug("cached %s", entity.id)
        result.append(entity)
    return result
