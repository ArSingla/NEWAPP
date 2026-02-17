const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const redis = require('../config/redis');

const OTP_TTL_SECONDS = 5 * 60;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 30;
const OTP_BCRYPT_ROUNDS = Number(process.env.OTP_BCRYPT_ROUNDS || 10);
const RESET_SESSION_TTL_SECONDS = 10 * 60;

const PURPOSE_REGISTER = 'register';
const PURPOSE_FORGOT = 'forgot';

const otpKey = (purpose, userId) => `otp:${purpose}:${userId}`;
const resetSessionKey = (userId) => `otp:forgot:session:${userId}`;

const now = () => Date.now();

const generateOtp = () => {
  return crypto.randomInt(0, 1000000).toString().padStart(6, '0');
};

const createOtpRecord = async ({ purpose, userId, channel, target }) => {
  const key = otpKey(purpose, userId);
  const existingPayload = await redis.get(key);

  if (existingPayload) {
    const existing = JSON.parse(existingPayload);
    const secondsSinceLastSend = Math.floor((now() - Number(existing.lastSentAt || 0)) / 1000);

    if (secondsSinceLastSend < OTP_RESEND_COOLDOWN_SECONDS) {
      const waitSeconds = OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLastSend;
      const error = new Error(`Please wait ${waitSeconds} seconds before requesting another OTP`);
      error.status = 429;
      throw error;
    }
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, OTP_BCRYPT_ROUNDS);
  const expiresAt = now() + OTP_TTL_SECONDS * 1000;

  const payload = {
    otpHash,
    otpExpiry: expiresAt,
    otpAttempts: 0,
    lastSentAt: now(),
    channel,
    target
  };

  await redis.set(key, JSON.stringify(payload), 'EX', OTP_TTL_SECONDS);

  return { otp, expiresAt };
};

const verifyOtpRecord = async ({ purpose, userId, otp }) => {
  const key = otpKey(purpose, userId);
  const payloadRaw = await redis.get(key);

  if (!payloadRaw) {
    return { ok: false, status: 400, message: 'OTP is invalid or has expired' };
  }

  const payload = JSON.parse(payloadRaw);

  if (now() > Number(payload.otpExpiry)) {
    await redis.del(key);
    return { ok: false, status: 400, message: 'OTP has expired' };
  }

  if (Number(payload.otpAttempts || 0) >= OTP_MAX_ATTEMPTS) {
    await redis.del(key);
    return { ok: false, status: 429, message: 'Maximum OTP attempts exceeded' };
  }

  const isMatch = await bcrypt.compare(String(otp), payload.otpHash);

  if (!isMatch) {
    payload.otpAttempts = Number(payload.otpAttempts || 0) + 1;
    const ttlSeconds = Math.max(1, Math.floor((Number(payload.otpExpiry) - now()) / 1000));

    if (payload.otpAttempts >= OTP_MAX_ATTEMPTS) {
      await redis.del(key);
      return { ok: false, status: 429, message: 'Maximum OTP attempts exceeded' };
    }

    await redis.set(key, JSON.stringify(payload), 'EX', ttlSeconds);
    return {
      ok: false,
      status: 400,
      message: `Invalid OTP. ${OTP_MAX_ATTEMPTS - payload.otpAttempts} attempts remaining`
    };
  }

  await redis.del(key);
  return { ok: true };
};

const createForgotResetSession = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(token, OTP_BCRYPT_ROUNDS);
  await redis.set(resetSessionKey(userId), tokenHash, 'EX', RESET_SESSION_TTL_SECONDS);
  return token;
};

const verifyForgotResetSession = async ({ userId, token }) => {
  const key = resetSessionKey(userId);
  const tokenHash = await redis.get(key);

  if (!tokenHash) {
    return false;
  }

  const isValid = await bcrypt.compare(String(token), tokenHash);
  if (isValid) {
    await redis.del(key);
  }

  return isValid;
};

module.exports = {
  OTP_TTL_SECONDS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  PURPOSE_REGISTER,
  PURPOSE_FORGOT,
  createOtpRecord,
  verifyOtpRecord,
  createForgotResetSession,
  verifyForgotResetSession
};
