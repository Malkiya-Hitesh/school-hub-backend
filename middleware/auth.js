// middleware/auth.js
// Verifies JWT from Authorization header (Bearer token)
// Attaches req.user = { id, email, role, schoolId }

const jwt  = require("jsonwebtoken");
const User = require("../models/User");

// ─── protect ─────────────────────────────────────────────────
// Use on any route that requires login
const protect = async (req, res, next) => {
  const token = req.cookies?.schoolHubToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized. Please login.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user (without password) to request
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account not found or deactivated.",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired. Please login again.",
    });
  }
};

// ─── requireRole ─────────────────────────────────────────────
// Usage: requireRole("superAdmin")
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};

// ─── Token generator (used in auth routes) ───────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = { protect, requireRole, generateToken };