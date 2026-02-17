const express = require('express');
const User = require('../models/User');
const Redemption = require('../models/Redemption');
const auth = require('../middleware/auth');

const router = express.Router();

// Points to cash conversion: 10 points = 5 rupees
const POINTS_TO_RUPEES = 5 / 10; // 0.5 rupees per point
const MIN_REDEMPTION_POINTS = 200;

// Get redemption history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== 'SERVICE_PROVIDER') {
      return res.status(403).json({ message: 'Access denied. Provider only.' });
    }

    const redemptions = await Redemption.find({ providerId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(redemptions);
  } catch (error) {
    console.error('Get redemption history error:', error);
    res.status(500).json({ message: 'Failed to get redemption history: ' + error.message });
  }
});

// Redeem points for cash
router.post('/cash', auth, async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== 'SERVICE_PROVIDER') {
      return res.status(403).json({ message: 'Access denied. Provider only.' });
    }

    if (!points || points < MIN_REDEMPTION_POINTS) {
      return res.status(400).json({ 
        message: `Minimum ${MIN_REDEMPTION_POINTS} points required for redemption` 
      });
    }

    if (user.points < points) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Calculate cash amount: 10 points = 5 rupees
    const cashAmount = Math.floor((points / 10) * 5); // In rupees

    // Create redemption record
    const redemption = await Redemption.create({
      providerId: req.userId,
      type: 'CASH',
      pointsUsed: points,
      cashAmount: cashAmount,
      currency: 'INR',
      status: 'PENDING'
    });

    // Deduct points from user
    user.points = user.points - points;
    
    // Add cash to wallet
    user.walletBalance = (user.walletBalance || 0) + cashAmount;
    
    await user.save();

    // Process redemption immediately (in production, might need approval)
    redemption.status = 'PROCESSED';
    redemption.processedAt = new Date();
    await redemption.save();

    res.json({
      message: 'Points redeemed successfully',
      redemption: {
        id: redemption._id,
        type: redemption.type,
        pointsUsed: redemption.pointsUsed,
        cashAmount: redemption.cashAmount,
        currency: redemption.currency,
        status: redemption.status
      },
      remainingPoints: user.points,
      walletBalance: user.walletBalance
    });
  } catch (error) {
    console.error('Redeem cash error:', error);
    res.status(500).json({ message: 'Failed to redeem points: ' + error.message });
  }
});

// Redeem points for coupon
router.post('/coupon', auth, async (req, res) => {
  try {
    const { points } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== 'SERVICE_PROVIDER') {
      return res.status(403).json({ message: 'Access denied. Provider only.' });
    }

    if (!points || points < MIN_REDEMPTION_POINTS) {
      return res.status(400).json({ 
        message: `Minimum ${MIN_REDEMPTION_POINTS} points required for redemption` 
      });
    }

    if (user.points < points) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Calculate coupon value: 10 points = 5 rupees
    const couponValue = Math.floor((points / 10) * 5); // In rupees

    // Generate coupon code
    const couponCode = `COUPON-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Create redemption record
    const redemption = await Redemption.create({
      providerId: req.userId,
      type: 'COUPON',
      pointsUsed: points,
      cashAmount: couponValue, // Coupon value in rupees
      currency: 'INR',
      couponCode: couponCode,
      status: 'PENDING'
    });

    // Deduct points from user
    user.points = user.points - points;
    await user.save();

    // Process redemption immediately
    redemption.status = 'PROCESSED';
    redemption.processedAt = new Date();
    await redemption.save();

    res.json({
      message: 'Coupon generated successfully',
      redemption: {
        id: redemption._id,
        type: redemption.type,
        pointsUsed: redemption.pointsUsed,
        couponValue: redemption.cashAmount,
        couponCode: redemption.couponCode,
        currency: redemption.currency,
        status: redemption.status
      },
      remainingPoints: user.points
    });
  } catch (error) {
    console.error('Redeem coupon error:', error);
    res.status(500).json({ message: 'Failed to redeem points for coupon: ' + error.message });
  }
});

// Get redemption eligibility info
router.get('/info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== 'SERVICE_PROVIDER') {
      return res.status(403).json({ message: 'Access denied. Provider only.' });
    }

    const userPoints = user.points || 0;
    const canRedeem = userPoints >= MIN_REDEMPTION_POINTS;
    const redeemableAmount = Math.floor((userPoints / 10) * 5); // In rupees

    res.json({
      currentPoints: userPoints,
      minimumPoints: MIN_REDEMPTION_POINTS,
      canRedeem,
      redeemableAmount,
      pointsToRupeesRate: '10 points = 5 rupees',
      pointsNeeded: canRedeem ? 0 : MIN_REDEMPTION_POINTS - userPoints
    });
  } catch (error) {
    console.error('Get redemption info error:', error);
    res.status(500).json({ message: 'Failed to get redemption info: ' + error.message });
  }
});

module.exports = router;
