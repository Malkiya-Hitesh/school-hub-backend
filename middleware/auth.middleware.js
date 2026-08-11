const jwt = require("jsonwebtoken");
const Parent = require("../models/parent.model");
const Student = require("../models/student.model");
const AppError = require("../utils/appError");

const getToken = (req) => {
  return (
    req.cookies?.schoolHubToken ||
    (req.headers.authorization?.startsWith("Bearer")
      ? req.headers.authorization.split(" ")[1]
      : null)
  );
};

const attachUser = async (req, res, next, Model, roleName) => {
  try {
    const token = getToken(req);

    if (!token) {
      return next(new AppError("Not authorized. No token found.", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return next(new AppError("Invalid token.", 401));
    }

    const user = await Model.findById(decoded.id).select("-password");

    if (!user) {
      return next(new AppError("User not found.", 401));
    }

    req.user = user;
    req.userRole = roleName;

    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token.", 401));
  }
};

const verifyJWTParent = async (req, res, next) => {
  return attachUser(req, res, next, Parent, "parent");
};

const verifyJWTStudent = async (req, res, next) => {
  return attachUser(req, res, next, Student, "student");
};

const verifyJWT = async (req, res, next) => {
  try {
    const token = getToken(req);

    if (!token) {
      return next(new AppError("Not authorized. No token found.", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return next(new AppError("Invalid token.", 401));
    }

    const parent = await Parent.findById(decoded.id).select("-password");
    if (parent) {
      req.user = parent;
      req.userRole = "parent";
      return next();
    }

    const student = await Student.findById(decoded.id).select("-password");
    if (student) {
      req.user = student;
      req.userRole = "student";
      return next();
    }

    return next(new AppError("User not found.", 401));
  } catch (error) {
    return next(new AppError("Invalid or expired token.", 401));
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.userRole || !roles.includes(req.userRole)) {
    return next(new AppError("Forbidden: insufficient permissions", 403));
  }

  next();
};

module.exports = {
  verifyJWT,
  verifyJWTParent,
  verifyJWTStudent,
  requireRole,
};
