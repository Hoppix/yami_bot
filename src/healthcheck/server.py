"""simple server for running a health check during integration"""

import logging

from aiohttp import web

from utility import utility

logger = logging.getLogger(__name__)

server_config = utility.load_resource("server_config.json")


async def start_healthcheck() -> None:
    port: int = server_config["port"]
    path: str = server_config["healthcheck_path"]

    async def health(request: web.Request) -> web.Response:
        return web.Response(text="ok")

    app = web.Application()
    app.router.add_get(path, health)

    runner = web.AppRunner(app, access_log=None)
    await runner.setup()
    await web.TCPSite(runner, port=port).start()
    logger.info("Running healthcheck on port: %s", port)
