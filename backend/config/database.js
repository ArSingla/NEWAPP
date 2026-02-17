const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const username = process.env.MONGODB_USERNAME || 'ArSin';
    const password = process.env.MONGODB_PASSWORD || 'ArjunSingla';
    const host = process.env.MONGODB_HOST || 'localhost';
    const port = process.env.MONGODB_PORT || 27017;
    const database = process.env.MONGODB_DATABASE || 'service_platform';
    const authDatabase = process.env.MONGODB_AUTH_DATABASE || 'admin';

    // Build connection URI
    let mongoURI;
    if (username && password) {
      mongoURI = `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=${authDatabase}`;
    } else {
      mongoURI = `mongodb://${host}:${port}/${database}`;
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;


