#!/bin/bash

# Immediately exit when error
set -e

# TODO: Update w/ npm package once published
PHANTOM_CORE_PACKAGE="github:zenosmosis/phantom-core"

echo "Installing to backend" \
  && cd ../backend \
  && npm install ${PHANTOM_CORE_PACKAGE}

echo "Installing to frontend" \
  && cd ../frontend.web \
  && npm install ${PHANTOM_CORE_PACKAGE}
  
# IMPORTANT: Shared directory installs in development folder only
echo "Installing to shared" \
  && cd ../shared \
  && npm install -D ${PHANTOM_CORE_PACKAGE}
