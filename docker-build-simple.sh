#!/bin/bash

echo "🐳 Building Service Platform with Docker (Simple Method)..."
echo "=========================================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "📦 Step 1: Pulling base images..."
echo "Pulling Maven + OpenJDK 17..."
docker pull maven:3.8.6-openjdk-17

echo "Pulling OpenJDK 17 JRE..."
docker pull openjdk:17-jre-slim

echo "Pulling Node.js 18..."
docker pull node:18-alpine

echo "Pulling Nginx..."
docker pull nginx:alpine

echo "Pulling MongoDB..."
docker pull mongo:7.0

echo "Pulling Redis..."
docker pull redis:7-alpine

echo ""
echo "🔨 Step 2: Building backend image..."
docker-compose build backend

echo ""
echo "🎨 Step 3: Building frontend image..."
docker-compose build frontend

echo ""
echo "✅ All Docker images built successfully!"
echo ""
echo "🚀 To start services, run: ./docker-start.sh"
echo "🛑 To stop services, run: ./docker-stop.sh"
echo "📋 To view logs, run: ./docker-logs.sh [service_name]"












