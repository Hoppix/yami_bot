import logging
from typing import TYPE_CHECKING

import discord
from discord import app_commands
from discord.ext import commands, tasks

from request_handler import dndbeyond_handler

if TYPE_CHECKING:
    from bot import Yami

logger = logging.getLogger(__name__)


class DndBeyond(commands.Cog):
    def __init__(self, bot: Yami) -> None:
        self.bot = bot
        self.seen_links: set[str] | None = None

    async def cog_load(self) -> None:
        self.poll_posts.start()

    async def cog_unload(self) -> None:
        self.poll_posts.cancel()

    @tasks.loop(hours=12)
    async def poll_posts(self) -> None:
        articles = await dndbeyond_handler.scrape_dnd_beyond_articles()

        # the first run only remembers what is already there, so restarts don't repost
        if self.seen_links is None:
            self.seen_links = {article.link for article in articles if article.link}
            logger.info("Remembering %s dndbeyond posts", len(self.seen_links))
            return

        new_articles = dndbeyond_handler.unseen_articles(articles, self.seen_links)
        self.seen_links.update(article.link for article in new_articles if article.link)
        await dndbeyond_handler.send_discord_message(self.bot.default_channel, new_articles)

    @poll_posts.before_loop
    async def before_poll_posts(self) -> None:
        await self.bot.wait_until_ready()

    @app_commands.command(description="DnDBeyond posts from the last 7 days")
    async def dndposts(self, interaction: discord.Interaction) -> None:
        await interaction.response.defer()
        await interaction.followup.send(await dndbeyond_handler.get_new_posts())
