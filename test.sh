#!/bin/bash

# Immediately exit when error
set -e

NODE_ENV=development

# TODO: Use npm ci to speed up npm builds
./build.dev.sh

cd shared && npm run test && cd ../

# cd backend && npm run test && cd ../

cd frontend.web && npm run test && cd ../

# TODO: Test that production builds (build.prod.sh)
