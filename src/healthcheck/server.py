"""simple server for running a health check during integration"""

import logging
import math

import discord
from aiohttp import web

from utility import utility

logger = logging.getLogger(__name__)

server_config = utility.load_resource("server_config.json")


def is_healthy(client: discord.Client) -> bool:
    """connected to discord, latency is inf until the first heartbeat"""
    return client.is_ready() and not client.is_closed() and math.isfinite(client.latency)


async def start_healthcheck(client: discord.Client) -> None:
    port: int = server_config["port"]
    path: str = server_config["healthcheck_path"]

    async def health(request: web.Request) -> web.Response:
        if not is_healthy(client):
            return web.Response(status=503, text="not connected")
        return web.Response(text="ok")

    app = web.Application()
    app.router.add_get(path, health)

    runner = web.AppRunner(app, access_log=None)
    await runner.setup()
    await web.TCPSite(runner, port=port).start()
    logger.info("Running healthcheck on port: %s", port)
