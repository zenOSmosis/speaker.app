#!/bin/bash

# Immediately exit when error
set -e

echo "Skipping build step.  If you need to build it, run ./build.prod.sh"
# ./build.prod.sh

echo "Launching production Docker Compose configuration"
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up
