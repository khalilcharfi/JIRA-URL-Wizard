#!/bin/bash

set -e

# Ensure script is executable
chmod +x "$0"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "Starting Docker build environment..."

# Clean up any existing containers
echo "Cleaning up existing containers..."
docker-compose down --remove-orphans

# Run Docker Compose with build
echo "Building and starting containers..."
docker-compose up --build --force-recreate

# After completion, check if build was successful
if [ $? -eq 0 ]; then
    echo "Build completed successfully!"
    echo "Artifacts should be available in the build/ directory"
    
    # List the contents of the build directory
    echo "Contents of build directory:"
    ls -la build/
    
    # Check for packaged files
    echo "Checking for packaged files:"
    find build -maxdepth 1 -name "*.zip" -exec ls -lh {} \; || echo "No ZIP files found in build/"
else
    echo "Build failed. Check the logs above for details."
    exit 1
fi 