# MongoDB Setup Guide

## Prerequisites

1. **Install MongoDB** on your system:
   - **macOS**: `brew install mongodb-community`
   - **Windows**: Download from [MongoDB website](https://www.mongodb.com/try/download/community)
   - **Linux**: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB service**:
   - **macOS**: `brew services start mongodb-community`
   - **Windows**: MongoDB runs as a service
   - **Linux**: `sudo systemctl start mongod`

## Configuration

The application is configured to connect to MongoDB with these settings:

```properties
spring.data.mongodb.host=localhost
spring.data.mongodb.port=27017
spring.data.mongodb.database=service_platform
```

## Database Collections

The application will create these collections automatically:

1. **users** - User accounts and profiles
2. **payments** - Payment transactions

## Running the Application

1. **Start MongoDB** (if not already running)
2. **Run the Spring Boot application**:
   ```bash
   cd service-platform
   mvn spring-boot:run
   ```

## MongoDB Compass (Optional)

For a GUI to view your MongoDB data:
1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connect to: `mongodb://localhost:27017`
3. Navigate to the `service_platform` database

## Authentication (Optional)

If you want to enable MongoDB authentication:

1. **Create a MongoDB user**:
   ```javascript
   use service_platform
   db.createUser({
     user: "your_username",
     pwd: "your_password",
     roles: ["readWrite"]
   })
   ```

2. **Update application.properties**:
   ```properties
   spring.data.mongodb.username=your_username
   spring.data.mongodb.password=your_password
   ```

## Cloud MongoDB (Alternative)

For production, consider using MongoDB Atlas:
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `application.properties`:
   ```properties
   spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/service_platform
   ``` 