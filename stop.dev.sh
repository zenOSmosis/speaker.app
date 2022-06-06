#!/bin/bash

# Immediately exit when error
set -e

echo "*** Completely stopping containers ***"
docker compose -p "speakerapp-dev" down --remove-orphans
