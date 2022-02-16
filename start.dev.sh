#!/bin/bash

# Immediately exit when error
set -e

echo "Skipping build step.  If you need to build it, run ./build.dev.sh"
# ./build.dev.sh

GIT_HASH=$(git rev-parse --short=5 HEAD)

echo "Launching development Docker Compose configuration"
GIT_HASH=${GIT_HASH} docker-compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  up