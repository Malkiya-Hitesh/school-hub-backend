// controllers/auth.controller.js

const AppError = require("../utils/appError");
const { asyncHandler } = require("../utils/asyncHandler");
const { parseDurationMs } = require("../utils/duration");

const {
  findUserByEmail,
  createUser,
  updateUserProfile,
  findUserByIdWithPassword,
} = require("../services/auth.service");

const { generateToken } = require("../middleware/auth");

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  schoolId: user.schoolId,
  isActive: user.isActive,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

const COOKIE_MAX_AGE = parseDurationMs(process.env.JWT_EXPIRES_IN, 24 * 60 * 60 * 1000);

const setAuthCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE,
  };

  if (process.env.COOKIE_DOMAIN) {
    // Use explicit domain when provided (e.g., ".example.com") so cookie can be shared
    cookieOptions.domain = process.env.COOKIE_DOMAIN;
  }

  res.cookie("schoolHubToken", token, cookieOptions);
};

// Register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const user = await createUser({ name, email, password, phone });
  const token = generateToken(user._id);

  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: sanitizeUser(user),
  });
});

// Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account is deactivated", 403);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);
  setAuthCookie(res, token);

  res.json({
    success: true,
    message: "Login successful",
    data: sanitizeUser(user),
  });
});

// Get current user
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: sanitizeUser(req.user) });
});

// Update profile
const updateMe = asyncHandler(async (req, res) => {
  const updates = {};

  if (req.body.name?.trim()) updates.name = req.body.name.trim();
  if (req.body.phone?.trim()) updates.phone = req.body.phone.trim();

  if (Object.keys(updates).length === 0) {
    throw new AppError("Nothing to update", 400);
  }

  const user = await updateUserProfile(req.user._id, updates);

  res.json({
    success: true,
    message: "Profile updated successfully",
    data: sanitizeUser(user),
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError("Current password and new password are required", 400);
  }
  if (newPassword.length < 6) {
    throw new AppError("New password must be at least 6 characters", 400);
  }

  const user = await findUserByIdWithPassword(req.user._id);

  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Current password incorrect", 401);
  }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: "Password changed successfully" });
});

// Logout
const logout = (req, res) => {
  res.clearCookie("schoolHubToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.json({ success: true, message: "Logged out successfully" });
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  logout,
};