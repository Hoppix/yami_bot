"""@author hoppix"""

import asyncio
import logging
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta

import aiohttp
import discord
from bs4 import BeautifulSoup, Tag
from dateutil import parser as date_parser

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


def schedule_dnd_beyond_event(chat_channel: discord.TextChannel) -> asyncio.Task[None]:
    """Repeated polling and scraping the dndbeyond posts"""

    async def event_loop() -> None:
        while True:
            await asyncio.sleep(POLL_INTERVAL_SECONDS)
            articles = await scrape_dnd_beyond_articles()
            await send_discord_message(chat_channel, articles)

    return asyncio.create_task(event_loop())


async def get_new_posts(message: discord.Message) -> None:
    articles = await scrape_dnd_beyond_articles()
    await message.reply(parse_message(articles))


async def scrape_dnd_beyond_articles() -> list[Article]:
    try:
        async with aiohttp.ClientSession(headers=HEADERS) as session, session.get(URL) as response:
            html = await response.text()
    except aiohttp.ClientError:
        logger.exception("Could not load dndbeyond posts")
        return []

    document = BeautifulSoup(html, "html.parser")
    articles = parse_articles(document.find_all("article"))
    return filter_articles_by_last_days(DAYS, articles)


def parse_articles(article_elements: list[Tag]) -> list[Article]:
    articles = []
    for element in article_elements:
        # the article link sits in a meta tag, href not found >_<
        link_element = element.find(attrs={"content": True})
        link = str(link_element["content"]) if link_element else None
        articles.append(parse_article(element.get_text(), link))
    return articles


def parse_article(article_text: str, link: str | None) -> Article:
    """parse the text of a single article element"""
    lines = [line.strip() for line in article_text.split("\n") if line.strip()]
    lines += [""] * (5 - len(lines))

    return Article(
        title=lines[0],
        date=_parse_date(lines[1]),
        author=lines[3],
        description=lines[4],
        link=link,
    )


def _parse_date(text: str) -> datetime | None:
    try:
        date = date_parser.parse(text)
    except ValueError, OverflowError:
        return None
    return date if date.tzinfo else date.replace(tzinfo=UTC)


def filter_articles_by_last_days(days: int, articles: list[Article]) -> list[Article]:
    threshold = datetime.now(UTC) - timedelta(days=days)
    return [article for article in articles if article.date and article.date >= threshold]


async def send_discord_message(discord_channel: discord.TextChannel | None, articles: list[Article]) -> None:
    if not articles:
        return
    message = parse_message(articles)
    if discord_channel:
        await discord_channel.send(message)
    logger.info(message)


def parse_message(articles: list[Article]) -> str:
    if not articles or not articles[0].link:
        return "I got blocked by DndBeyond.com"

    message = f"Found new Posts on DnDBeyond for the last {DAYS} days on {utility.parse_date_string()}\n"
    for article in articles:
        message += f"{article.link}\n"
    return message
