/**
 * simple server for running a health check during integration
 */
import express from "express";
import serverConfig from "../../resources/server_config.json";

export function startHealthcheck(): void {
    const app = express();
    const port = serverConfig.port;
    const path = serverConfig.healthcheck_path;

    app.get(path, (_req, res) => {
        res.send("ok");
    });

    app.listen(port, () => console.log("Running healthcheck on port: ", port));
}
