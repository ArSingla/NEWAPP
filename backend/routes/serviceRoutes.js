const express = require('express');
const User = require('../models/User');
const Rating = require('../models/Rating');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all services (service types)
router.get('/', (req, res) => {
  const services = [
    { id: 'chef', name: 'Chef', icon: '🍳', color: '#FF5722' },
    { id: 'bartender', name: 'Bartender', icon: '🍸', color: '#9C27B0' },
    { id: 'maid', name: 'Maid', icon: '🧹', color: '#4CAF50' },
    { id: 'waiter', name: 'Waiter', icon: '🛎️', color: '#FFC107' },
    { id: 'driver', name: 'Personal Driver', icon: '🚗', color: '#2196F3' }
  ];
  res.json(services);
});

// Mock provider data generator
const generateMockProviders = (serviceType, count = 12) => {
  const serviceNames = {
    'chef': ['Chef Raj', 'Chef Priya', 'Chef Arjun', 'Chef Meera', 'Chef Vikram', 'Chef Anjali', 'Chef Rohan', 'Chef Kavya', 'Chef Dev', 'Chef Neha', 'Chef Sameer', 'Chef Pooja', 'Chef Aditya', 'Chef Shreya', 'Chef Karan'],
    'bartender': ['Mixologist Alex', 'Bartender Sam', 'Cocktail Master Ryan', 'Bar Expert Lisa', 'Drinks Pro Mike', 'Mix Master Emma', 'Bar Star Jake', 'Cocktail Queen Zoe', 'Drink Wizard Tom', 'Bar Pro Sarah', 'Mix Expert Dan', 'Cocktail Pro Amy', 'Bar Master Chris', 'Drinks Expert Mia', 'Mix Star Leo'],
    'maid': ['Cleaning Pro Rita', 'Housekeeper Sunita', 'Clean Expert Meera', 'Home Care Priya', 'Cleaning Star Kavya', 'House Pro Anjali', 'Clean Master Radha', 'Home Expert Sita', 'Cleaning Pro Deepa', 'House Care Neha', 'Clean Star Pooja', 'Home Pro Shreya', 'Cleaning Expert Kavita', 'House Master Riya', 'Clean Pro Divya'],
    'waiter': ['Server John', 'Waiter Mike', 'Service Pro Sarah', 'Server Expert Emma', 'Waiter Pro Alex', 'Service Star Lisa', 'Server Pro Ryan', 'Waiter Expert Zoe', 'Service Master Jake', 'Server Pro Amy', 'Waiter Star Dan', 'Service Expert Tom', 'Server Pro Chris', 'Waiter Master Mia', 'Service Pro Leo'],
    'driver': ['Driver Ravi', 'Chauffeur Kumar', 'Drive Pro Raj', 'Driver Expert Vikram', 'Chauffeur Pro Arjun', 'Drive Star Dev', 'Driver Master Sameer', 'Chauffeur Expert Aditya', 'Drive Pro Karan', 'Driver Star Rohan', 'Chauffeur Pro Neeraj', 'Drive Expert Manoj', 'Driver Pro Suresh', 'Chauffeur Star Ajay', 'Drive Master Rohit']
  };

  const names = serviceNames[serviceType.toLowerCase()] || serviceNames['chef'];
  const basePrices = {
    'chef': 1500,
    'bartender': 1200,
    'maid': 800,
    'waiter': 1000,
    'driver': 2000
  };

  return Array.from({ length: Math.min(count, names.length) }, (_, i) => ({
    _id: `mock_provider_${serviceType}_${i}`,
    name: names[i],
    email: `${serviceType}${i}@serviceplatform.com`,
    role: 'SERVICE_PROVIDER',
    providerType: serviceType.toUpperCase(),
    rating: (4 + Math.random() * 1).toFixed(1), // 4.0 to 5.0
    totalRatings: Math.floor(Math.random() * 50) + 10,
    experience: `${Math.floor(Math.random() * 10) + 2} years`,
    pricePerHour: basePrices[serviceType.toLowerCase()] + Math.floor(Math.random() * 500),
    isAvailable: Math.random() > 0.2 // 80% available
  }));
};

// Get service providers by type
router.get('/providers/:serviceType', async (req, res) => {
  try {
    const { serviceType } = req.params;
    
    // Map service type to provider type
    const providerTypeMap = {
      'chef': 'CHEF',
      'bartender': 'BARTENDER',
      'maid': 'MAID',
      'waiter': 'WAITER',
      'driver': 'DRIVER'
    };

    const providerType = providerTypeMap[serviceType.toLowerCase()];
    if (!providerType) {
      return res.status(400).json({ message: 'Invalid service type' });
    }

    // Find providers by type and role
    let providers = await User.find({
      role: 'SERVICE_PROVIDER',
      providerType: providerType
    }).select('-password');

    // If no providers in DB, return mock data
    if (providers.length === 0) {
      providers = generateMockProviders(serviceType, 12);
    } else {
      // Calculate average rating for each provider
      providers = await Promise.all(
        providers.map(async (provider) => {
          const ratings = await Rating.find({ providerId: provider._id });
          const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
            : (4 + Math.random() * 1).toFixed(1);

          return {
            ...provider.toObject(),
            rating: parseFloat(avgRating).toFixed(1),
            totalRatings: ratings.length || Math.floor(Math.random() * 50) + 10,
            experience: `${Math.floor(Math.random() * 10) + 2} years`,
            isAvailable: Math.random() > 0.2
          };
        })
      );
    }

    // Sort by rating and availability
    providers.sort((a, b) => {
      if (a.isAvailable !== b.isAvailable) return b.isAvailable - a.isAvailable;
      return parseFloat(b.rating) - parseFloat(a.rating);
    });

    res.json(providers);
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ message: 'Failed to get providers: ' + error.message });
  }
});

// Book a service
router.post('/book', auth, async (req, res) => {
  try {
    const { serviceType, providerId, providerName, date, amount, currency } = req.body;

    if (!serviceType || !providerId) {
      return res.status(400).json({ message: 'Service type and provider ID are required' });
    }

    // Get provider name if not provided
    let providerNameToUse = providerName;
    let actualProviderId = providerId;
    
    if (!providerNameToUse || providerId.startsWith('mock_provider_')) {
      // Handle mock providers
      const mockProviders = generateMockProviders(serviceType, 15);
      const provider = mockProviders.find(p => p._id === providerId);
      if (provider) {
        providerNameToUse = provider.name;
        actualProviderId = null; // Don't store mock provider ID
      } else {
        providerNameToUse = providerName || 'Provider';
      }
    } else {
      // Real provider from database
      const provider = await User.findById(providerId);
      if (provider) {
        providerNameToUse = provider.name;
        actualProviderId = providerId;
      } else {
        providerNameToUse = providerName || 'Provider';
        actualProviderId = null;
      }
    }

    // Create a booking record
    const booking = await Booking.create({
      serviceType,
      providerId: actualProviderId,
      providerName: providerNameToUse,
      customerId: req.userId,
      amount: amount || 0,
      currency: currency || 'INR',
      status: 'PENDING',
      bookingDate: new Date(),
      serviceDate: date ? new Date(date) : new Date(),
      durationHours: req.body.durationHours || 1 // Default 1 hour
    });

    res.status(201).json({
      message: 'Service booked successfully',
      booking: {
        id: booking._id,
        serviceType: booking.serviceType,
        providerId: booking.providerId,
        providerName: booking.providerName,
        customerId: booking.customerId,
        date: booking.bookingDate,
        serviceDate: booking.serviceDate,
        status: booking.status,
        amount: booking.amount,
        currency: booking.currency
      }
    });
  } catch (error) {
    console.error('Book service error:', error);
    res.status(500).json({ message: 'Failed to book service: ' + error.message });
  }
});

module.exports = router;

