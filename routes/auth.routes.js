// routes/auth.js
// POST /api/auth/register  — create account
// POST /api/auth/login     — login, get token
// GET  /api/auth/me        — get current user (protected)

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, generateToken } = require("../middleware/auth");

// ─── Helpers ─────────────────────────────────────────────────

// Strip sensitive fields for response
const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  schoolId: user.schoolId,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

// ─── POST /api/auth/register ─────────────────────────────────
// New school admin signs up — no school linked yet at this point
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Basic validation
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please login.",
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      phone: phone?.trim() || null,
    });

    const token = generateToken(user._id);

    res.cookie("schoolHubToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: sanitizeUser(user),
    });

  } catch (err) {
    console.error("POST /auth/register error:", err.message);
    res.status(500).json({ success: false, message: "Registration failed." });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user — explicitly select password (it's select:false in schema)
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account deactivated. Contact support.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    res.cookie("schoolHubToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful.",
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("POST /auth/login error:", err.message);
    res.status(500).json({ success: false, message: "Login failed." });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────
// Returns current logged-in user info
router.get("/me", protect, async (req, res) => {
  try {
    res.json({
      success: true,
      user: sanitizeUser(req.user),
    });
  } catch (err) {
    console.error("GET /auth/me error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/auth/me ──────────────────────────────────────
// Update own profile (name, phone)
router.patch("/me", protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const updates = {};
    if (name?.trim()) updates.name = name.trim();
    if (phone?.trim()) updates.phone = phone.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nothing to update.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Profile updated.",
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error("PATCH /auth/me error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH /api/auth/change-password ────────────────────────
router.patch("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Both current and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters.",
      });
    }

    // Re-fetch with password
    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;
    await user.save(); // triggers bcrypt pre-save hook

    res.json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("PATCH /auth/change-password error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});


router.post("/logout", (req, res) => {
res.clearCookie("schoolHubToken", {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});
module.exports = router;