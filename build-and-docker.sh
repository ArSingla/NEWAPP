#!/bin/bash

echo "🔨 Building Service Platform with Docker..."
echo "=========================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Build Spring Boot JAR first
echo "📦 Building Spring Boot JAR..."
cd service-platform

if ! command -v mvn &> /dev/null; then
    echo "❌ Maven is not installed. Installing Maven wrapper..."
    if [ ! -f "mvnw" ]; then
        echo "❌ Maven wrapper not found. Please install Maven or use Maven wrapper."
        exit 1
    fi
    ./mvnw clean package -DskipTests
else
    mvn clean package -DskipTests
fi

if [ ! -f "target/*.jar" ]; then
    echo "❌ JAR file not found. Build failed."
    exit 1
fi

echo "✅ JAR built successfully!"
cd ..

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build

echo "✅ Docker images built successfully!"
echo ""
echo "🚀 To start services, run: ./docker-start.sh"
echo "🛑 To stop services, run: ./docker-stop.sh"
echo "📋 To view logs, run: ./docker-logs.sh [service_name]"












