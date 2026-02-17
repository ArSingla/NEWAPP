const express = require('express');
const paymentService = require('../services/paymentService');
const User = require('../models/User');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');

const router = express.Router();

// Create payment intent
router.post('/create-intent', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount is required and must be positive' });
    }

    const clientSecret = await paymentService.createPaymentIntent(amount, currency);
    res.json({ clientSecret });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ message: error.message || 'Failed to create payment intent' });
  }
});

// Add money to wallet
router.post('/wallet/top-up', auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount is required and must be positive' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create payment record for top-up
    const payment = new Payment({
      customerId: req.userId,
      amount: amount,
      currency: 'INR',
      status: 'SUCCESS',
      serviceType: 'WALLET_TOPUP'
    });
    await payment.save();

    // Update user wallet balance
    user.walletBalance = (user.walletBalance || 0) + amount;
    await user.save();

    res.json({
      message: 'Wallet topped up successfully',
      walletBalance: user.walletBalance,
      amountAdded: amount
    });
  } catch (error) {
    console.error('Wallet top-up error:', error);
    res.status(500).json({ message: error.message || 'Failed to top up wallet' });
  }
});

// Get wallet balance
router.get('/wallet/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      walletBalance: user.walletBalance || 0,
      points: user.points || 0
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({ message: error.message || 'Failed to get wallet balance' });
  }
});

// Pay from wallet
router.post('/wallet/pay', auth, async (req, res) => {
  try {
    const { amount, serviceType, providerId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount is required and must be positive' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentBalance = user.walletBalance || 0;
    if (currentBalance < amount) {
      return res.status(400).json({ 
        message: 'Insufficient wallet balance',
        currentBalance,
        requiredAmount: amount
      });
    }

    // Deduct from wallet
    user.walletBalance = currentBalance - amount;
    await user.save();

    // Create payment record
    const payment = new Payment({
      customerId: req.userId,
      providerId: providerId || null,
      amount: amount,
      currency: 'INR',
      status: 'SUCCESS',
      serviceType: serviceType || null
    });
    await payment.save();

    res.json({
      message: 'Payment successful',
      walletBalance: user.walletBalance,
      amountPaid: amount,
      paymentId: payment._id
    });
  } catch (error) {
    console.error('Wallet payment error:', error);
    res.status(500).json({ message: error.message || 'Failed to process payment' });
  }
});

module.exports = router;


