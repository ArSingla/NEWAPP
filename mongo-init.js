// MongoDB initialization script
db = db.getSiblingDB('service_platform');

// Create collections
db.createCollection('users');
db.createCollection('payments');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });
db.payments.createIndex({ "userId": 1 });
db.payments.createIndex({ "createdAt": 1 });

// Create a service user for the application
db.createUser({
  user: "service_user",
  pwd: "service_password",
  roles: [
    { role: "readWrite", db: "service_platform" }
  ]
});

print("MongoDB initialization completed successfully!");



