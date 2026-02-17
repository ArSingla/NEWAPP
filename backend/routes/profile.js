const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get profile
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile: ' + error.message });
  }
});

// Update profile
router.put('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, providerType, preferredLanguage, gender, country, phoneNumber } = req.body;

    if (name) user.name = name;
    if (providerType) user.providerType = providerType;
    if (preferredLanguage) user.preferredLanguage = preferredLanguage;
    if (gender) user.gender = gender;
    if (country) user.country = country;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile: ' + error.message });
  }
});

module.exports = router;


