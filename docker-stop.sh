#!/bin/bash

echo "🛑 Stopping Service Platform Docker services..."
echo "=============================================="

# Stop all services
docker-compose down

echo "✅ All services stopped successfully!"
echo ""
echo "📋 To start services again, run: ./docker-start.sh"
echo "📋 To remove all data and start fresh, run: docker-compose down -v"












