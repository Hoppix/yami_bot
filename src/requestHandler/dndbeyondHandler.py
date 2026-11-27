"""@author hoppix"""

import asyncio
import logging
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import aiohttp
import discord
from bs4 import BeautifulSoup, Tag
from dateutil import parser as dateParser

from utility import utility

logger = logging.getLogger(__name__)

URL = "http://www.dndbeyond.com/posts"
HEADERS = {
    # header fake to go around robots.txt
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"
    ),
}
DAYS = 7
POLL_INTERVAL_SECONDS = 12 * 60 * 60  # every 12 hours, because cronjobs are too hard


@dataclass
class Article:
    title: str
    date: datetime | None
    author: str
    description: str
    link: str | None


def scheduleDndBeyondEvent(chatChannel: discord.TextChannel) -> asyncio.Task[None]:
    """Repeated polling and scraping the dndbeyond posts"""

    async def eventLoop() -> None:
        while True:
            await asyncio.sleep(POLL_INTERVAL_SECONDS)
            articles = await scrapeDndBeyondArticles()
            await sendDiscordMessage(chatChannel, articles)

    return asyncio.create_task(eventLoop())


async def getNewPosts(message: discord.Message) -> None:
    articles = await scrapeDndBeyondArticles()
    await message.reply(parseMessage(articles))


async def scrapeDndBeyondArticles() -> list[Article]:
    try:
        async with aiohttp.ClientSession(headers=HEADERS) as session, session.get(URL) as response:
            html = await response.text()
    except aiohttp.ClientError:
        logger.exception("Could not load dndbeyond posts")
        return []

    document = BeautifulSoup(html, "html.parser")
    articles = parseArticles(document.find_all("article"))
    return filterArticlesByLastDays(DAYS, articles)


def parseArticles(articleElements: list[Tag]) -> list[Article]:
    articles = []
    for element in articleElements:
        # the article link sits in a meta tag, href not found >_<
        linkElement = element.find(attrs={"content": True})
        link = str(linkElement["content"]) if linkElement else None
        articles.append(parseArticle(element.get_text(), link))
    return articles


def parseArticle(articleText: str, link: str | None) -> Article:
    """parse the text of a single article element"""
    lines = [line.strip() for line in articleText.split("\n") if line.strip()]
    lines += [""] * (5 - len(lines))

    return Article(
        title=lines[0],
        date=_parseDate(lines[1]),
        author=lines[3],
        description=lines[4],
        link=link,
    )


def _parseDate(text: str) -> datetime | None:
    try:
        date = dateParser.parse(text)
    except ValueError, OverflowError:
        return None
    return date if date.tzinfo else date.replace(tzinfo=UTC)


def filterArticlesByLastDays(days: int, articles: list[Article]) -> list[Article]:
    threshold = datetime.now(UTC) - timedelta(days=days)
    return [article for article in articles if article.date and article.date >= threshold]


async def sendDiscordMessage(discordChannel: discord.TextChannel | None, articles: list[Article]) -> None:
    if not articles:
        return
    message = parseMessage(articles)
    if discordChannel:
        await discordChannel.send(message)
    logger.info(message)


def parseMessage(articles: list[Article]) -> str:
    if not articles or not articles[0].link:
        return "I got blocked by DndBeyond.com"

    message = f"Found new Posts on DnDBeyond for the last {DAYS} days on {utility.parseDateString()}\n"
    for article in articles:
        message += f"{article.link}\n"
    return message
