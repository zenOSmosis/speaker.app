#!/bin/bash

# Required dependencies to run this script:
#
# - git
# - docker
# - docker-compose

# Immediately exit when error
set -e

# Read in environment variables
if test -f ".env"
then
  source .env
else
  echo "No .env file"
  exit 1
fi

GIT_HASH=$(git rev-parse --short=5 HEAD)
GIT_BRANCH=$(git symbolic-ref --short HEAD)

echo "Installing and updating git modules"
git submodule init
git submodule update

echo "*** Linking shared modules with backend ***"
cd backend/src \
  && mkdir -p tmp.shared \
  && cp -r shared/* tmp.shared \
  && cd ../../

echo "*** Linking shared modules with frontend ***"
cd frontend.web/src/portals/SpeakerAppPortal \
  && mkdir -p tmp.shared \
  && cp -r shared/* tmp.shared \
  && cd ../../../../

echo "*** Building production Docker Compose config ***"
docker-compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  build \
  --build-arg GIT_HASH="$GIT_HASH" \
  --build-arg GIT_BRANCH="$GIT_BRANCH" \
  --build-arg BUILD_ENV="production"

echo "*** Removing shared module temporary directories ***"
rm -rf backend/src/tmp.shared
rm -rf frontend.web/src/tmp.shared

echo "*** Production build complete ***"
