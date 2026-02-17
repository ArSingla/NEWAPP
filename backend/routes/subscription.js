const express = require('express');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's subscription
router.get('/', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.userId,
      status: 'ACTIVE'
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.json({
        planType: 'BASIC',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: null,
        autoRenew: false
      });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Failed to get subscription: ' + error.message });
  }
});

// Subscribe to a plan
router.post('/subscribe', auth, async (req, res) => {
  try {
    const { planType, paymentMethod } = req.body;

    if (!planType || !['BASIC', 'PREMIUM', 'VIP'].includes(planType)) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Plan prices
    const planPrices = {
      BASIC: 0,
      PREMIUM: 29.99,
      VIP: 99.99
    };

    const planPrice = planPrices[planType];

    // If not BASIC, check payment
    if (planPrice > 0) {
      if (paymentMethod === 'wallet') {
        // Pay from wallet
        if ((user.walletBalance || 0) < planPrice) {
          return res.status(400).json({ 
            message: 'Insufficient wallet balance',
            required: planPrice,
            current: user.walletBalance || 0
          });
        }

        // Deduct from wallet
        user.walletBalance = (user.walletBalance || 0) - planPrice;
        await user.save();

        // Create payment record
        const payment = new Payment({
          customerId: req.userId,
          amount: planPrice,
          currency: 'INR',
          status: 'SUCCESS',
          serviceType: 'SUBSCRIPTION'
        });
        await payment.save();
      } else {
        // For other payment methods, you would integrate with payment gateway
        return res.status(400).json({ message: 'Please use wallet payment for now' });
      }
    }

    // Cancel existing active subscriptions
    await Subscription.updateMany(
      { userId: req.userId, status: 'ACTIVE' },
      { status: 'CANCELLED' }
    );

    // Create new subscription
    const subscription = new Subscription({
      userId: req.userId,
      planType: planType,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: planType === 'BASIC' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      autoRenew: planType !== 'BASIC',
      amount: planPrice,
      currency: 'INR'
    });
    await subscription.save();

    res.json({
      message: 'Subscription activated successfully',
      subscription
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ message: 'Failed to subscribe: ' + error.message });
  }
});

// Cancel subscription
router.post('/cancel', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      userId: req.userId,
      status: 'ACTIVE'
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    subscription.status = 'CANCELLED';
    subscription.autoRenew = false;
    await subscription.save();

    res.json({
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Failed to cancel subscription: ' + error.message });
  }
});

module.exports = router;


