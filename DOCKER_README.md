# 🐳 Docker Setup for Service Platform

This document explains how to use Docker to run your Service Platform application, making it lightweight, portable, and easy to deploy.

## 🎯 **Benefits of Docker**

- **🚀 Lightweight**: No need to install Java, Node.js, or MongoDB locally
- **🔄 Consistent**: Same environment across development, testing, and production
- **📦 Portable**: Easy to deploy anywhere Docker is available
- **🔧 Isolated**: Each service runs in its own container
- **📊 Scalable**: Easy to scale individual services
- **🧹 Clean**: No local dependencies to manage

## 📋 **Prerequisites**

1. **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
2. **Docker Compose** - Usually included with Docker Desktop

## 🚀 **Quick Start**

### **1. Start All Services**
```bash
./docker-start.sh
```

### **2. Stop All Services**
```bash
./docker-stop.sh
```

### **3. View Logs**
```bash
./docker-logs.sh backend    # Backend logs
./docker-logs.sh frontend   # Frontend logs
./docker-logs.sh mongodb    # Database logs
./docker-logs.sh all        # All logs
```

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    MongoDB      │
│   (React)       │◄──►│  (Spring Boot)  │◄──►│   (Database)    │
│   Port: 3000    │    │   Port: 8080    │    │   Port: 27017   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │     Redis       │
                    │   (Cache)       │
                    │   Port: 6379    │
                    └─────────────────┘
```

## 📁 **Docker Files Structure**

```
NEWAPP/
├── docker-compose.yml          # Main orchestration file
├── docker-start.sh             # Start all services
├── docker-stop.sh              # Stop all services
├── docker-logs.sh              # View service logs
├── .dockerignore               # Global ignore file
├── mongo-init.js               # MongoDB initialization
├── service-platform/
│   ├── Dockerfile              # Backend container
│   └── .dockerignore           # Backend ignore file
└── frontend/
    ├── Dockerfile              # Frontend container
    ├── nginx.conf              # Nginx configuration
    └── .dockerignore           # Frontend ignore file
```

## 🔧 **Service Details**

### **Frontend (React + Nginx)**
- **Port**: 3000 → 80 (container)
- **Base Image**: nginx:alpine
- **Features**: 
  - Static file serving
  - Client-side routing support
  - Gzip compression
  - Security headers
  - API proxy capability

### **Backend (Spring Boot)**
- **Port**: 8080
- **Base Image**: openjdk:24-jre-slim
- **Features**:
  - Multi-stage build
  - Health checks
  - Security user
  - Optimized JRE

### **MongoDB**
- **Port**: 27017
- **Base Image**: mongo:7.0
- **Features**:
  - Persistent data storage
  - Authentication enabled
  - Health checks
  - Initialization scripts

### **Redis (Optional)**
- **Port**: 6379
- **Base Image**: redis:7-alpine
- **Features**:
  - Caching layer
  - Persistent data
  - Health checks

## 🛠️ **Manual Commands**

### **Build and Start**
```bash
# Build all services
docker-compose build

# Start in background
docker-compose up -d

# Start with logs
docker-compose up
```

### **Service Management**
```bash
# View running services
docker-compose ps

# Restart specific service
docker-compose restart backend

# Stop specific service
docker-compose stop frontend

# View service logs
docker-compose logs backend
docker-compose logs -f frontend  # Follow logs
```

### **Data Management**
```bash
# Remove all containers and volumes
docker-compose down -v

# Remove specific volumes
docker volume rm newapp_mongodb_data

# Backup MongoDB data
docker exec service_platform_mongodb mongodump --out /backup
docker cp service_platform_mongodb:/backup ./backup
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Port Already in Use**
```bash
# Check what's using the port
lsof -i :8080
lsof -i :3000

# Kill the process or change ports in docker-compose.yml
```

#### **Service Won't Start**
```bash
# Check logs
./docker-logs.sh backend

# Check service status
docker-compose ps

# Restart service
docker-compose restart backend
```

#### **MongoDB Connection Issues**
```bash
# Check MongoDB logs
./docker-logs.sh mongodb

# Check if MongoDB is ready
docker exec service_platform_mongodb mongosh --eval "db.adminCommand('ping')"
```

#### **Frontend Not Loading**
```bash
# Check nginx logs
./docker-logs.sh frontend

# Check if nginx is running
docker exec service_platform_frontend nginx -t
```

### **Reset Everything**
```bash
# Stop and remove everything
docker-compose down -v --rmi all

# Remove all images
docker system prune -a

# Start fresh
./docker-start.sh
```

## 📊 **Performance Optimization**

### **Image Size Reduction**
- Multi-stage builds
- Alpine-based images
- .dockerignore files
- Layer caching optimization

### **Resource Limits**
Add to `docker-compose.yml`:
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### **Volume Optimization**
```yaml
volumes:
  mongodb_data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: ./data/mongodb
```

## 🚀 **Production Deployment**

### **Environment Variables**
Create `.env` file:
```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure_password
MONGO_DATABASE=service_platform
SPRING_PROFILES_ACTIVE=prod
```

### **Security Considerations**
- Change default passwords
- Use secrets management
- Enable SSL/TLS
- Restrict network access
- Regular security updates

### **Monitoring**
```bash
# Resource usage
docker stats

# Service health
docker-compose ps

# Log aggregation
docker-compose logs --tail=100
```

## 📚 **Useful Commands Reference**

```bash
# View all containers
docker ps -a

# View all images
docker images

# View all volumes
docker volume ls

# View all networks
docker network ls

# Clean up unused resources
docker system prune

# View container details
docker inspect service_platform_backend

# Execute commands in container
docker exec -it service_platform_backend sh
docker exec -it service_platform_mongodb mongosh
```

## 🎉 **Success!**

Your Service Platform is now running with Docker! 

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

The application is now lightweight, portable, and ready for development, testing, and production deployment! 🚀












