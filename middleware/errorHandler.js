
// middleware/errorHandler.js
const AppError = require("../utils/appError");

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    err = new AppError("Invalid ID format", 400);
  }

  // Duplicate key error
  if (err.code === 11000) {
    err = new AppError("Duplicate field value", 400);
  }

  // Validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((el) => el.message)
      .join(", ");

    err = new AppError(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

module.exports = errorHandler;