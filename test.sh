#!/bin/bash

# Immediately exit when error
set -e

# Don't run Docker Compose in test environment
BUILD_ENV=test

NODE_ENV=development

# TODO: Use npm ci to speed up npm builds
./build.dev.sh

cd shared && npm run test && cd ../

# cd backend && npm run test && cd ../

cd frontend.web && CI=true npm run test && cd ../

# TODO: Test that production builds (build.prod.sh)
