const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['chef', 'bartender', 'maid', 'waiter', 'driver']
  },
  providerName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  serviceDate: {
    type: Date,
    default: Date.now
  },
  durationHours: {
    type: Number,
    default: 1,
    min: 0.5 // Minimum 30 minutes
  },
  pointsAwarded: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Index for efficient queries
bookingSchema.index({ customerId: 1, status: 1 });
bookingSchema.index({ providerId: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

