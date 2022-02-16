#!/bin/bash

# Required dependencies to run this script:
#
# - git
# - node / npm
# - docker
# - docker-compose

# Immediately exit when error
set -e

# TODO: Enable otional npm ci command for CI environments
# @see https://coryrylan.com/blog/faster-npm-installs-with-npm-ci
NPM_INSTALL_CMD="npm install"

echo "*** Installing and updating git modules ***"
git submodule init
git submodule update

echo "*** Starting development modules install ***" \
  && echo "*** Installing npm modules in backend ***" \
  && cd backend \
  && $NPM_INSTALL_CMD \
  && cd .. \
  \
  && echo "*** Installing npm modules in shared ***" \
  && cd shared \
  && $NPM_INSTALL_CMD \
  && cd .. \
  \
  && echo "*** Installing npm modules in frontend.web ***" \
  && cd frontend.web \
  && $NPM_INSTALL_CMD \
  && cd ..
  
  # FIXME: avatar_server has to be modified on its own since it relies on an older node version
  # The built Docker container has to be used, instead
  # && echo "*** Installing npm modules in avatar_server ***" \
  # && cd avatar_server \
  # && npm install \
  # && cd .. \

# TODO: Implement ability to not run Docker Compose
echo "*** Building development Docker Compose ***"
docker-compose \
  -f docker-compose.yml \
  -f docker-compose.dev.yml \
  build \
  --build-arg BUILD_ENV="development"

echo "*** Development build complete ***"
