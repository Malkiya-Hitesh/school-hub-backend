// utils/otp.js

const crypto = require("crypto");

const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_OTP_ATTEMPTS = 5;

const generateOTP = () => {
  // 6-digit numeric OTP, uniformly distributed, cryptographically secure.
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
  return crypto.createHash("sha256").update(String(otp)).digest("hex");
};

const verifyOTPHash = (otp, hash) => {
  if (!otp || !hash) return false;
  const candidate = hashOTP(otp);
  const a = Buffer.from(candidate);
  const b = Buffer.from(hash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTPHash,
  OTP_TTL_MS,
  MAX_OTP_ATTEMPTS,
};