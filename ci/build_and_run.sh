#!/bin/bash

set -e
set -u
set -o pipefail
set -x

sudo docker build -t yami_bot .
sudo docker run -d -v "$PWD/resources/api_config.json:/usr/src/yami/build/resources/api_config.json:ro" -v /tmp/yami/logs:/tmp/yami/logs -v /tmp/yami/commands:/tmp/yami/commands yami_bot

