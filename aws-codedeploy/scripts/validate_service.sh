#!/bin/bash

# Validate Service Hook - Run to validate the deployment

echo "Starting Validate Service Hook"
echo "Current time: $(date)"

# Health check URL - adjust based on your load balancer
HEALTH_CHECK_URL="http://localhost:3000/api/health"

# Maximum number of attempts
MAX_ATTEMPTS=10
ATTEMPT=1

echo "Validating spoken service health"

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    echo "Health check attempt $ATTEMPT of $MAX_ATTEMPTS"
    
    # Make health check request
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_CHECK_URL)
    
    if [ $HTTP_STATUS -eq 200 ]; then
        echo "✅ Health check passed! HTTP Status: $HTTP_STATUS"
        echo "Service is healthy and responding correctly"
        echo "Validate Service Hook completed successfully"
        exit 0
    else
        echo "❌ Health check failed. HTTP Status: $HTTP_STATUS"
        
        if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
            echo "Max attempts reached. Validation failed."
            exit 1
        fi
        
        echo "Waiting 30 seconds before retry..."
        sleep 30
        ATTEMPT=$((ATTEMPT + 1))
    fi
done

echo "Validate Service Hook failed"
exit 1