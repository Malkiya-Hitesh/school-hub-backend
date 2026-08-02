// middleware/studentAuth.js
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const AppError = require("../utils/appError");

const protectStudent = async (req, res, next) => {
  try {
    const token =
      req.cookies?.studentToken ||
      (req.headers.authorization?.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return next(new AppError("Not authorized. No token found.", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "student") {
      return next(new AppError("Invalid token type.", 401));
    }

    const student = await Student.findById(decoded.id).select("-password");

    if (!student) {
      return next(new AppError("Student not found.", 401));
    }

    if (!student.isActive) {
      return next(new AppError("Account is deactivated.", 403));
    }

    req.student = student;
    next();
  } catch (err) {
    next(new AppError("Invalid or expired token.", 401));
  }
};

const generateStudentToken = (studentId) => {
  return jwt.sign({ id: studentId, type: "student" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

module.exports = { protectStudent, generateStudentToken };