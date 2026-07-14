const AppError = require("../utils/appError");

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return next(
      new AppError(
        "Name, email and password are required",
        400
      )
    );
  }

  if (password.length < 6) {
    return next(
      new AppError(
        "Password must be at least 6 characters",
        400
      )
    );
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return next(
      new AppError(
        "Email and password are required",
        400
      )
    );
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
};