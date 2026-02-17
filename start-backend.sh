#!/bin/bash

echo "Starting Service Platform Backend (Node.js)..."
echo "Backend will be available at: http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo ""

cd backend

# Ensure Node.js and npm are installed
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is not installed. Please install Node 18+ and retry."
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed. Please install npm and retry."
  exit 1
fi

# Install dependencies if missing
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
fi

# Create .env if missing
if [ ! -f .env ]; then
  echo "Creating default .env from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env
  else
    echo "PORT=8080" > .env
    echo "MONGODB_HOST=localhost" >> .env
    echo "MONGODB_PORT=27017" >> .env
    echo "MONGODB_DATABASE=service_platform" >> .env
    echo "JWT_SECRET=your-super-secret-jwt-key-change-in-production" >> .env
  fi
  echo "⚠️  Please update .env with your MongoDB credentials and JWT secret"
fi

# macOS Gatekeeper/quarantine fix (safe no-ops on other OSes)
xattr -dr com.apple.quarantine . 2>/dev/null || true

npm start
