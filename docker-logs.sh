#!/bin/bash

echo "📋 Service Platform Docker Logs"
echo "================================"

# Check if service name is provided
if [ -z "$1" ]; then
    echo "Usage: $0 [service_name]"
    echo ""
    echo "Available services:"
    echo "  mongodb  - Database logs"
    echo "  backend  - Spring Boot logs"
    echo "  frontend - React/nginx logs"
    echo "  redis    - Redis logs"
    echo "  all      - All services logs"
    echo ""
    echo "Examples:"
    echo "  $0 backend    # View backend logs"
    echo "  $0 all        # View all logs"
    echo "  $0            # Show this help"
    exit 1
fi

SERVICE=$1

if [ "$SERVICE" = "all" ]; then
    echo "📋 Viewing logs for all services..."
    echo "Press Ctrl+C to stop following logs"
    echo ""
    docker-compose logs -f
else
    echo "📋 Viewing logs for $SERVICE service..."
    echo "Press Ctrl+C to stop following logs"
    echo ""
    docker-compose logs -f $SERVICE
fi












