#!/bin/bash

echo "Starting Service Platform Frontend..."
echo "Frontend will be available at: http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

cd frontend

# Ensure Node and npm are installed
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
  echo "Installing frontend dependencies..."
  if [ -f package-lock.json ]; then
    npm ci || npm install
  else
    npm install
  fi
fi

# Create default .env if missing
if [ ! -f .env ]; then
  echo "Creating default .env (REACT_APP_API_URL)"
  echo "REACT_APP_API_URL=http://localhost:8080/api" > .env
fi

# macOS Gatekeeper/quarantine and line-ending fix (safe no-ops on other OSes)
echo "Normalizing script permissions and clearing quarantine (if any)..."
xattr -dr com.apple.quarantine . 2>/dev/null || true
find node_modules/.bin -type f -exec chmod +x {} \; 2>/dev/null || true
find node_modules -type f -name "react-scripts" -exec chmod +x {} \; 2>/dev/null || true
find node_modules -type f -name "react-scripts" -exec sed -i '' -e 's/\r$//' {} \; 2>/dev/null || true

npm start
