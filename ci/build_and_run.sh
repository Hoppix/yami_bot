#!/bin/bash

set -e
set -u
set -o pipefail
set -x

git pull
make compile
sudo docker build -t yami_bot .
sudo docker run -d -v /tmp/yami/logs:/tmp/yami/logs -v /tmp/yami/commands:/tmp/yami/commands yami_bot

