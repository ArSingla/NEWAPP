const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN'],
    default: 'CUSTOMER'
  },
  providerType: {
    type: String,
    enum: ['CHEF', 'BARTENDER', 'MAID', 'WAITER', 'DRIVER', null],
    default: null
  },
  preferredLanguage: {
    type: String,
    default: 'en'
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER', null],
    default: null
  },
  country: {
    type: String,
    default: null
  },
  phoneNumber: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationCodeExpiry: {
    type: Date,
    default: null
  },
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  points: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

