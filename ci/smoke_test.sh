#!/bin/bash

set -e
set -u
set -o pipefail
set -x

sleep 60 # wait a minute for the container to run

DOCKER_RUNS=$(docker ps --all | grep yami_bot) 

if [[ ! $DOCKER_RUNS == *"Exited"* ]]; then
	echo "The container is not running"
  exit 1
fi

DOCKER_BOT_STARTED=$(docker logs yami_bot | grep "Startup time:")
if [[ -z $DOCKER_BOT_STARTED ]]; then
	echo "There where no startup logs"
	exit 1
fi