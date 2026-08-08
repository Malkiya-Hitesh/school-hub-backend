// validators/auth.validator.js

const AppError = require("../utils/appError");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegister = (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return next(new AppError("Name, email and password are required", 400));
  }

  if (!EMAIL_RE.test(email.trim())) {
    return next(new AppError("A valid email is required", 400));
  }

  if (password.length < 6) {
    return next(new AppError("Password must be at least 6 characters", 400));
  }

  if (phone !== undefined && phone !== null && String(phone).trim() !== "") {
    if (!/^[0-9+\-\s]{7,15}$/.test(String(phone).trim())) {
      return next(new AppError("Invalid phone number", 400));
    }
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return next(new AppError("Email and password are required", 400));
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};