#!/bin/bash

# Make script exit on error
set -e

# Set memory limits and disable V8 code cache which can cause segfaults
export NODE_OPTIONS="--no-node-snapshot --max-old-space-size=8192"

# Print environment information
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PNPM version: $(pnpm -v)"
echo "NODE_OPTIONS: $NODE_OPTIONS"

# Try to build with retry logic
MAX_RETRIES=3
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  echo "Build attempt $(($RETRY_COUNT+1)) of $MAX_RETRIES"
  
  # Clear any cached data that might be corrupted
  if [ -d "node_modules/.cache" ]; then
    echo "Clearing node_modules/.cache directory"
    rm -rf node_modules/.cache
  fi
  
  # Try to run the build
  if pnpm build; then
    echo "Build completed successfully!"
    exit 0
  else
    EXIT_CODE=$?
    RETRY_COUNT=$(($RETRY_COUNT+1))
    
    echo "Build failed with exit code $EXIT_CODE"
    
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
      echo "Retrying in 5 seconds..."
      sleep 5
    else
      echo "Maximum retry attempts reached. Build failed."
      exit $EXIT_CODE
    fi
  fi
done 