"""simple server for running a health check during integration"""

import logging

from aiohttp import web

from utility import utility

logger = logging.getLogger(__name__)

serverConfig = utility.loadResource("server_config.json")


async def startHealthcheck() -> None:
    port: int = serverConfig["port"]
    path: str = serverConfig["healthcheck_path"]

    async def health(request: web.Request) -> web.Response:
        return web.Response(text="ok")

    app = web.Application()
    app.router.add_get(path, health)

    runner = web.AppRunner(app, access_log=None)
    await runner.setup()
    await web.TCPSite(runner, port=port).start()
    logger.info("Running healthcheck on port: %s", port)
