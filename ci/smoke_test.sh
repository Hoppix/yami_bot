#!/bin/bash

set -e
set -u
set -o pipefail
set -x

sleep 10 # wait a minute for the container to run

DOCKER_RUNS=$(docker ps --all | grep yami_bot) 
CONTAINER_ID=${DOCKER_RUNS:0:3}

if [[ $DOCKER_RUNS == *"Exited"* ]]; then
	echo "The container is not running"
  exit 1
fi

DOCKER_BOT_STARTED=$(docker logs $CONTAINER_ID | grep "Startup time:")
echo $(docker logs $CONTAINER_ID)

if [[ -z $DOCKER_BOT_STARTED ]]; then
	echo "There where no startup logs"
	exit 1
fi

# do healthcheck via endpoint

# kill the container upon confirmation
docker kill $CONTAINER_ID