// middleware/parentAuth.js
const jwt = require("jsonwebtoken");
const Parent = require("../models/Parent");
const AppError = require("../utils/appError");

const protectParent = async (req, res, next) => {
  try {
    const token =
      req.cookies?.parentToken ||
      (req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return next(new AppError("Not authorized. No token found.", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "parent") {
      return next(new AppError("Invalid token type.", 401));
    }

    const parent = await Parent.findById(decoded.id).select("-password");

    if (!parent) {
      return next(new AppError("Parent not found.", 401));
    }

    if (!parent.isActive) {
      return next(new AppError("Account is deactivated.", 403));
    }

    req.parent = parent;
    next();
  } catch (err) {
    next(new AppError("Invalid or expired token.", 401));
  }
};

const generateParentToken = (parentId) => {
  return jwt.sign({ id: parentId, type: "parent" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = { protectParent, generateParentToken };