const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const {
  sendEmailOtp,
  sendSmsOtp
} = require('../services/awsNotificationService');
const {
  PURPOSE_REGISTER,
  PURPOSE_FORGOT,
  createOtpRecord,
  verifyOtpRecord,
  createForgotResetSession,
  verifyForgotResetSession
} = require('../utils/otp');

const router = express.Router();

const emailVerificationEnabled = process.env.FEATURE_EMAIL_VERIFICATION_ENABLED !== 'false';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many OTP requests. Please try again later.' }
});

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts. Please try again later.' }
});

const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/;

const validateRequest = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return false;
  }

  return true;
};

const sendOtpByMethod = async ({ method, email, phoneNumber, otp, purpose }) => {
  if (method === 'email') {
    await sendEmailOtp({ toEmail: email, otp, purpose });
    return;
  }

  if (method === 'phone') {
    await sendSmsOtp({ phoneNumber, otp, purpose });
    return;
  }

  if (method === 'both') {
    await Promise.all([
      sendEmailOtp({ toEmail: email, otp, purpose }),
      phoneNumber ? sendSmsOtp({ phoneNumber, otp, purpose }) : Promise.resolve()
    ]);
    return;
  }

  throw new Error('Unsupported OTP method');
};

const getForgotMessage = (method) => {
  if (method === 'phone') {
    return 'OTP has been sent to your registered phone number';
  }

  return 'OTP has been sent to your registered email';
};

const getAvailableMethods = (user) => {
  const methods = [];

  if (user.email) {
    methods.push('email');
  }

  if (user.phoneNumber && E164_PHONE_REGEX.test(user.phoneNumber)) {
    methods.push('phone');
  }

  return methods;
};

// Register
router.post('/register', authRateLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('phoneNumber').optional({ nullable: true, checkFalsy: true }).matches(E164_PHONE_REGEX)
    .withMessage('phoneNumber must be in E.164 format, e.g. +14155552671')
], async (req, res) => {
  try {
    if (!validateRequest(req, res)) {
      return;
    }

    const { email, password, name, role, providerType, phoneNumber } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use!' });
    }

    const validProviderTypes = ['CHEF', 'BARTENDER', 'MAID', 'WAITER', 'DRIVER'];
    if (role === 'SERVICE_PROVIDER') {
      if (!providerType) {
        return res.status(400).json({ message: 'Provider type is required for service providers' });
      }
      if (!validProviderTypes.includes(providerType.toUpperCase())) {
        return res.status(400).json({ message: 'Invalid provider type. Must be one of: CHEF, BARTENDER, MAID, WAITER, DRIVER' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role || 'CUSTOMER',
      providerType: role === 'SERVICE_PROVIDER' ? providerType.toUpperCase() : null,
      phoneNumber: phoneNumber || null,
      isVerified: !emailVerificationEnabled,
      emailVerified: !emailVerificationEnabled,
      verificationCode: null,
      verificationCodeExpiry: null
    };

    const user = await User.create(userData);

    if (emailVerificationEnabled) {
      const otpMethod = user.phoneNumber ? 'both' : 'email';
      const { otp } = await createOtpRecord({
        purpose: PURPOSE_REGISTER,
        userId: String(user._id),
        channel: otpMethod,
        target: otpMethod === 'both' ? `${user.email},${user.phoneNumber}` : user.email
      });

      await sendOtpByMethod({
        method: otpMethod,
        email: user.email,
        phoneNumber: user.phoneNumber,
        otp,
        purpose: PURPOSE_REGISTER
      });
    }

    return res.status(201).json({
      message: emailVerificationEnabled
        ? 'Registration successful. OTP sent for account verification.'
        : 'Registration successful. Email verification is disabled.',
      requiresVerification: emailVerificationEnabled,
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(error.status || 500).json({ message: 'Registration failed: ' + error.message });
  }
});

// Verify registration OTP
router.post('/verify-otp', otpRateLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  try {
    if (!validateRequest(req, res)) {
      return;
    }

    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified || user.emailVerified) {
      return res.status(200).json({ message: 'User is already verified' });
    }

    const verificationResult = await verifyOtpRecord({
      purpose: PURPOSE_REGISTER,
      userId: String(user._id),
      otp
    });

    if (!verificationResult.ok) {
      return res.status(verificationResult.status).json({ message: verificationResult.message });
    }

    user.isVerified = true;
    user.emailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();

    return res.json({
      message: 'OTP verified successfully. Your account is now verified.',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(error.status || 500).json({ message: 'OTP verification failed: ' + error.message });
  }
});

// Resend registration OTP
router.post('/resend-otp', otpRateLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('method').optional().isIn(['email', 'phone'])
], async (req, res) => {
  try {
    if (!validateRequest(req, res)) {
      return;
    }

    const { email, method } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified || user.emailVerified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    const selectedMethod = method || (user.phoneNumber ? 'phone' : 'email');
    if (selectedMethod === 'phone' && !user.phoneNumber) {
      return res.status(400).json({ message: 'No registered phone number found for this account' });
    }

    const target = selectedMethod === 'phone' ? user.phoneNumber : user.email;
    const { otp } = await createOtpRecord({
      purpose: PURPOSE_REGISTER,
      userId: String(user._id),
      channel: selectedMethod,
      target
    });

    await sendOtpByMethod({
      method: selectedMethod,
      email: user.email,
      phoneNumber: user.phoneNumber,
      otp,
      purpose: PURPOSE_REGISTER
    });

    return res.json({ message: `OTP resent successfully via ${selectedMethod}` });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(error.status || 500).json({ message: 'Failed to resend OTP: ' + error.message });
  }
});

// Forgot password - request OTP
router.post('/forgot-password', otpRateLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('method').optional().isIn(['email', 'phone'])
], async (req, res) => {
  try {
    if (!validateRequest(req, res)) {
      return;
    }

    const { email, method } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const availableMethods = getAvailableMethods(user);
    if (availableMethods.length === 0) {
      return res.status(400).json({ message: 'No valid registered email/phone found for OTP delivery' });
    }

    if (!method) {
      return res.status(400).json({
        message: 'Please choose OTP delivery method',
        availableMethods
      });
    }

    if (!availableMethods.includes(method)) {
      return res.status(400).json({ message: `Selected method is unavailable. Available methods: ${availableMethods.join(', ')}` });
    }

    const target = method === 'phone' ? user.phoneNumber : user.email;
    const { otp } = await createOtpRecord({
      purpose: PURPOSE_FORGOT,
      userId: String(user._id),
      channel: method,
      target
    });

    await sendOtpByMethod({
      method,
      email: user.email,
      phoneNumber: user.phoneNumber,
      otp,
      purpose: PURPOSE_FORGOT
    });

    return res.json({ message: getForgotMessage(method) });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(error.status || 500).json({ message: 'Failed to process forgot password request: ' + error.message });
  }
});

// Verify forgot-password OTP
router.post('/verify-forgot-otp', otpRateLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('otp').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  try {
    if (!validateRequest(req, res)) {
      return;
    }

    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const verificationResult = await verifyOtpRecord({
      purpose: PURPOSE_FORGOT,
      userId: String(user._id),
      otp
    });

    if (!verificationResult.ok) {
      return res.status(verificationResult.status).json({ message: verificationResult.message });
    }

    const resetToken = await createForgotResetSession(String(user._id));

    return res.json({
      message: 'OTP verified. You can now reset your password.',
      resetToken
    });
  } catch (error) {
    console.error('Verify forgot OTP error:', error);
    return res.status(error.status || 500).json({ message: 'Failed to verify forgot password OTP: ' + error.message });
  }
});

// Reset password after forgot-password OTP verification
router.post('/reset-password', authRateLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('resetToken').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    if (!validateRequest(req, res)) {
      return;
    }

    const { email, resetToken, newPassword } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const canReset = await verifyForgotResetSession({
      userId: String(user._id),
      token: resetToken
    });

    if (!canReset) {
      return res.status(400).json({ message: 'Invalid or expired reset session. Please verify OTP again.' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(error.status || 500).json({ message: 'Password reset failed: ' + error.message });
  }
});

// Backward compatibility endpoint
router.post('/verify-email', otpRateLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('verificationCode').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res) => {
  try {
    if (!validateRequest(req, res)) {
      return;
    }

    const { email, verificationCode } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified || user.emailVerified) {
      return res.status(200).json({ message: 'User is already verified' });
    }

    const verificationResult = await verifyOtpRecord({
      purpose: PURPOSE_REGISTER,
      userId: String(user._id),
      otp: verificationCode
    });

    if (!verificationResult.ok) {
      return res.status(verificationResult.status).json({ message: verificationResult.message });
    }

    user.isVerified = true;
    user.emailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiry = null;
    await user.save();

    return res.json({
      message: 'Email verified successfully! You can now login.',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(error.status || 500).json({ message: 'Verification failed: ' + error.message });
  }
});

// Backward compatibility endpoint
router.post('/resend-verification', otpRateLimiter, [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    if (!validateRequest(req, res)) {
      return;
    }

    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified || user.emailVerified) {
      return res.status(400).json({ message: 'Email is already verified' });
    }

    const { otp } = await createOtpRecord({
      purpose: PURPOSE_REGISTER,
      userId: String(user._id),
      channel: 'email',
      target: user.email
    });

    await sendOtpByMethod({
      method: 'email',
      email: user.email,
      phoneNumber: user.phoneNumber,
      otp,
      purpose: PURPOSE_REGISTER
    });

    return res.json({ message: 'New verification code sent to your email' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(error.status || 500).json({ message: 'Failed to resend verification: ' + error.message });
  }
});

// Login
router.post('/login', authRateLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    if (!validateRequest(req, res)) {
      return;
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (emailVerificationEnabled && !(user.isVerified || user.emailVerified)) {
      return res.status(401).json({ message: 'Please verify your account before logging in' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    return res.json({
      message: 'Login successful!',
      token,
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      providerType: user.providerType
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed: ' + error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logout successful!' });
});

// Social Auth - Google
router.post('/google', async (req, res) => {
  try {
    const { token, email, name } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-16);
      user = await User.create({
        email: email.toLowerCase(),
        name,
        password: await bcrypt.hash(randomPassword, 10),
        role: 'CUSTOMER',
        emailVerified: true,
        isVerified: true
      });
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.json({
      message: 'Google authentication successful!',
      token: jwtToken,
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      providerType: user.providerType
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ message: 'Authentication failed: ' + error.message });
  }
});

// Social Auth - Facebook
router.post('/facebook', async (req, res) => {
  try {
    const { token, email, name } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-16);
      user = await User.create({
        email: email.toLowerCase(),
        name,
        password: await bcrypt.hash(randomPassword, 10),
        role: 'CUSTOMER',
        emailVerified: true,
        isVerified: true
      });
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.json({
      message: 'Facebook authentication successful!',
      token: jwtToken,
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      providerType: user.providerType
    });
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({ message: 'Authentication failed: ' + error.message });
  }
});

// Social Auth - Instagram
router.post('/instagram', async (req, res) => {
  try {
    const { token, email, name } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-16);
      user = await User.create({
        email: email.toLowerCase(),
        name,
        password: await bcrypt.hash(randomPassword, 10),
        role: 'CUSTOMER',
        emailVerified: true,
        isVerified: true
      });
    }

    const jwtToken = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.json({
      message: 'Instagram authentication successful!',
      token: jwtToken,
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      providerType: user.providerType
    });
  } catch (error) {
    console.error('Instagram auth error:', error);
    res.status(500).json({ message: 'Authentication failed: ' + error.message });
  }
});

module.exports = router;
