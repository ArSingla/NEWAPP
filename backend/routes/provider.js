const express = require('express');
const Payment = require('../models/Payment');
const Rating = require('../models/Rating');
const User = require('../models/User');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// Get provider stats
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== 'SERVICE_PROVIDER') {
      return res.status(403).json({ message: 'Access denied. Provider only.' });
    }

    // Get all bookings for this provider (services provided)
    // For now, we'll get bookings by providerId or by provider name matching
    let bookings = await Booking.find({ providerId: req.userId });
    
    // Also get bookings where providerId is null but providerName matches user's name
    // This handles mock providers
    if (bookings.length === 0) {
      bookings = await Booking.find({ 
        providerName: user.name,
        providerId: null 
      });
    }
    
    // Get completed bookings only for stats
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    
    // Calculate total services provided
    const totalServicesProvided = completedBookings.length;
    
    // Get all payments for this provider to calculate earnings
    const payments = await Payment.find({ providerId: req.userId });
    
    // Calculate total earnings in paise (for INR)
    const totalEarningsInPaise = payments
      .filter(p => p.status === 'SUCCESS' && p.currency === 'INR')
      .reduce((sum, p) => sum + Math.round(p.amount * 100), 0); // Convert to paise

    // Calculate total points from completed bookings
    const pointsGathered = completedBookings.reduce((sum, booking) => {
      return sum + (booking.pointsAwarded || (booking.durationHours || 1) * 10);
    }, 0);
    
    // Get user's current points (from user model)
    const userPoints = user.points || 0;
    
    // Calculate redeemable amount: 10 points = 5 rupees
    const redeemableAmount = Math.floor(userPoints / 10) * 5; // In rupees
    const canRedeem = userPoints >= 200;

    // Get all ratings
    const ratings = await Rating.find({ providerId: req.userId });
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    // Get recent services (from bookings)
    const recentServices = completedBookings
      .slice(-10)
      .reverse()
      .map(b => ({
        serviceType: b.serviceType || 'Unknown',
        date: b.serviceDate || b.createdAt,
        amountInPaise: Math.round((b.amount || 0) * 100)
      }));

    res.json({
      totalServicesProvided,
      totalEarningsInPaise,
      pointsGathered,
      userPoints,
      redeemableAmount: redeemableAmount * 100, // In paise
      canRedeem,
      rating: avgRating,
      recent: recentServices
    });
  } catch (error) {
    console.error('Get provider stats error:', error);
    res.status(500).json({ message: 'Failed to get provider stats: ' + error.message });
  }
});

// Get provider bookings (upcoming and recent)
router.get('/bookings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user || user.role !== 'SERVICE_PROVIDER') {
      return res.status(403).json({ message: 'Access denied. Provider only.' });
    }

    let bookings = await Booking.find({
      providerId: req.userId,
      status: { $in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
    }).sort({ serviceDate: 1, createdAt: -1 });
    
    // Also check by name for mock providers
    if (bookings.length === 0) {
      bookings = await Booking.find({
        providerName: user.name,
        providerId: null,
        status: { $in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
      }).sort({ serviceDate: 1, createdAt: -1 });
    }

    res.json(bookings);
  } catch (error) {
    console.error('Get provider bookings error:', error);
    res.status(500).json({ message: 'Failed to get provider bookings: ' + error.message });
  }
});

// Complete a booking (provider marks service as completed)
router.put('/bookings/:id/complete', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user || user.role !== 'SERVICE_PROVIDER') {
      return res.status(403).json({ message: 'Access denied. Provider only.' });
    }

    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if booking belongs to this provider
    const isOwner = booking.providerId?.toString() === req.userId.toString() ||
                    (booking.providerId === null && booking.providerName === user.name);
    
    if (!isOwner) {
      return res.status(403).json({ message: 'You can only complete your own bookings' });
    }

    if (booking.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Booking already completed' });
    }

    // Calculate points based on duration: 1 hour = 10 points
    const durationHours = booking.durationHours || 1;
    const pointsToAward = Math.round(durationHours * 10);

    // Update booking status and points
    booking.status = 'COMPLETED';
    booking.pointsAwarded = pointsToAward;
    await booking.save();

    // Award points to provider
    user.points = (user.points || 0) + pointsToAward;
    await user.save();

    res.json({
      message: 'Booking completed successfully',
      booking,
      pointsAwarded: pointsToAward,
      totalPoints: user.points,
      durationHours: durationHours
    });
  } catch (error) {
    console.error('Complete booking error:', error);
    res.status(500).json({ message: 'Failed to complete booking: ' + error.message });
  }
});

module.exports = router;


