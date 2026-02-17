#!/bin/bash

echo "🚀 Starting Service Platform Application..."
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    pkill -f "node.*server.js"
    pkill -f "react-scripts"
    exit 0
}

# Set up trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend in background (auto-install/env)
echo "🔧 Starting Backend (Node.js)..."
pushd backend >/dev/null
if ! command -v node >/dev/null 2>&1; then echo "Error: Node.js missing"; exit 1; fi
if ! command -v npm >/dev/null 2>&1; then echo "Error: npm missing"; exit 1; fi
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install || { echo "Backend install failed"; exit 1; }
fi
if [ ! -f .env ]; then
  if [ -f .env.example ]; then cp .env.example .env; else
    echo "PORT=8080" > .env
    echo "MONGODB_HOST=localhost" >> .env
    echo "MONGODB_DATABASE=service_platform" >> .env
    echo "JWT_SECRET=your-super-secret-jwt-key-change-in-production" >> .env
  fi
fi
xattr -dr com.apple.quarantine . 2>/dev/null || true
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
popd >/dev/null

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 15

# Check if backend is running
if curl -s http://localhost:8080/api/auth/register > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:8080"
else
    echo "❌ Backend failed to start. Check backend.log for details."
    exit 1
fi

# Start frontend in background (auto-install/env)
echo "🎨 Starting Frontend (React)..."
pushd frontend >/dev/null
if ! command -v node >/dev/null 2>&1; then echo "Error: Node.js missing"; exit 1; fi
if ! command -v npm >/dev/null 2>&1; then echo "Error: npm missing"; exit 1; fi
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  if [ -f package-lock.json ]; then npm ci || npm install; else npm install; fi
fi
if [ ! -f .env ]; then echo "REACT_APP_API_URL=http://localhost:8080/api" > .env; fi
# Normalize permissions, remove quarantine, fix CRLF
xattr -dr com.apple.quarantine . 2>/dev/null || true
find node_modules/.bin -type f -exec chmod +x {} \; 2>/dev/null || true
find node_modules -type f -name "react-scripts" -exec chmod +x {} \; 2>/dev/null || true
find node_modules -type f -name "react-scripts" -exec sed -i '' -e 's/\r$//' {} \; 2>/dev/null || true
npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
popd >/dev/null

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 10

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost:3000"
else
    echo "❌ Frontend failed to start. Check frontend.log for details."
    exit 1
fi

echo ""
echo "🎉 Service Platform is now running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait
