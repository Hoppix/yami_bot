/**
 * simple server for running a health check during integration
 *
 */
const express = require("express");
const serverConfig = require("../../resources/server_config.json")


function startHealthcheck() {

    const app = express()
    const port = serverConfig.port;
    const path = serverConfig.healthcheck_path;

    app.get(path, (req, res) => {
        res.send('ok')
    })

    app.listen(port, () => console.log("Running healthcheck on port: ", port))

}

module.exports.startHealthcheck = startHealthcheck;