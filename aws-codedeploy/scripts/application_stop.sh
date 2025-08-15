#!/bin/bash

# Application Stop Hook - Run before stopping the old application version

echo "Starting Application Stop Hook"
echo "Current time: $(date)"

# Application is stopping
echo "Stopping spoken application"

# You can add cleanup tasks here
# For example: graceful shutdown, session cleanup, etc.

echo "Application Stop Hook completed successfully"