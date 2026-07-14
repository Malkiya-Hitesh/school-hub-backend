const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/appError");

// Protect routes
const protect = async (req, res, next) => {
try {
const token =req.cookies?.schoolHubToken ||
(req.headers.authorization?.startsWith("Bearer")
? req.headers.authorization.split(" ")[1]
: null);


if (!token) {
  return next(new AppError("Not authorized. No token found.", 401));
}

const decoded = jwt.verify(token, process.env.JWT_SECRET);

const user = await User.findById(decoded.id).select("-password");

if (!user) {
  return next(new AppError("User not found.", 401));
}

if (!user.isActive) {
  return next(new AppError("Account is deactivated.", 403));
}

req.user = user;

next();


} catch (err) {
next(new AppError("Invalid or expired token.", 401));
}
};

// Role-based access
const requireRole = (...roles) => {
return (req, res, next) => {
if (!req.user) {
return next(new AppError("Unauthorized", 401));
}


if (!roles.includes(req.user.role)) {
  return next(
    new AppError("Forbidden: insufficient permissions", 403)
  );
}

next();


};
};

// Generate JWT
const generateToken = (userId) => {
return jwt.sign(
{ id: userId },
process.env.JWT_SECRET,
{
expiresIn: process.env.JWT_EXPIRES_IN || "7d",
}
);
};

module.exports = {
protect,
requireRole,
generateToken,
};
