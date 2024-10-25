/**
 * simple server for running a health check during integration
 *
 */
import express from "express";
import { port as _port, healthcheck_path } from "../../resources/server_config.json";


function startHealthcheck() {

    const app = express()
    const port = _port;
    const path = healthcheck_path;

    app.get(path, (_, res) => {
        res.send('ok')
    })

    app.listen(port, () => console.log("Running healthcheck on port: ", port))

}

const _startHealthcheck = startHealthcheck;
export { _startHealthcheck as startHealthcheck };
