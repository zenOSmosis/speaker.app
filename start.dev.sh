#!/bin/bash

# Immediately exit when error
set -e

echo "Skipping build step.  If you need to build it, run ./build.dev.sh"
# ./build.dev.sh

echo "Launching development Docker Compose configuration"
docker-compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  up