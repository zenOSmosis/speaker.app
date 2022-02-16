#!/bin/bash

# Immediately exit when error
set -e

# TODO: Enable otional npm ci command for CI environments
# @see https://coryrylan.com/blog/faster-npm-installs-with-npm-ci
NPM_INSTALL_CMD="npm install"

NODE_ENV=development

# TODO: Add backend tests
echo "*** Starting test development modules install ***" \
  && echo "*** Installing npm modules in shared ***" \
  && cd shared \
  && $NPM_INSTALL_CMD \
  && cd .. # \
  # TODO: Uncomment
  # \
  # && echo "*** Installing npm modules in frontend.web ***" \
  # && cd frontend.web \
  # && $NPM_INSTALL_CMD \
  # && cd ..

cd shared && npm run test && cd ../

# TODO: Uncomment
# cd backend && npm run test && cd ../

# TODO: Uncomment
# cd frontend.web && CI=true npm run test && cd ../
