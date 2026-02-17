const mongoose = require('mongoose');

const redemptionSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['CASH', 'COUPON'],
    required: true
  },
  pointsUsed: {
    type: Number,
    required: true,
    min: 200 // Minimum redemption threshold
  },
  cashAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  couponCode: {
    type: String,
    default: null // Only for COUPON type
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Index for efficient queries
redemptionSchema.index({ providerId: 1, status: 1 });

module.exports = mongoose.model('Redemption', redemptionSchema);
