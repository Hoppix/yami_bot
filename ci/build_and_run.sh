#!/bin/bash

set -e
set -u
set -o pipefail
set -x

sudo docker system prune -f
make compile
sudo docker build -t yami_bot .
sudo docker run yami_bot -d