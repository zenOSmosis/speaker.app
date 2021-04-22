#!/bin/bash

# Immediately exit when error
set -e

echo "*** Completely stopping containers ***"
docker-compose down --remove-orphans
