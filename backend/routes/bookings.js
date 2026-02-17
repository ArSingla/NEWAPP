const express = require('express');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user's bookings
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    const query = { customerId: req.userId };
    if (status) {
      query.status = status.toUpperCase();
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Failed to get bookings: ' + error.message });
  }
});

// Get active bookings (PENDING, CONFIRMED, IN_PROGRESS)
router.get('/active', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({
      customerId: req.userId,
      status: { $in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] }
    })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get active bookings error:', error);
    res.status(500).json({ message: 'Failed to get active bookings: ' + error.message });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ message: 'Failed to get booking: ' + error.message });
  }
});

// Cancel booking
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customerId: req.userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }

    booking.status = 'CANCELLED';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Failed to cancel booking: ' + error.message });
  }
});

module.exports = router;




