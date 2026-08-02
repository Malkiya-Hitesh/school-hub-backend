// src/middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");
const Parent = require("../models/parent.model");
const Student = require("../models/student.model");
const { ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler");
const AppError = require("../utils/appError");

// Verifies the accessToken cookie (or Authorization: Bearer header as a
// fallback for non-browser clients), figures out if it's a parent or
// student token via the `role` claim, and attaches:
//   req.user      -> the Parent or Student document (no password/refreshToken)
//   req.userRole  -> "parent" | "student"
const verifyJWTStudent =   async (req, res, next) => {
  try{
  const token = req.cookies?.schoolHubToken ||
(req.headers.authorization?.startsWith("Bearer")
? req.headers.authorization.split(" ")[1]
: null);
if (!token) {
  return next(new AppError("Not authorized. No token found.", 401));
}

 
 const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await Student.findById(decoded.id).select("-password");
if (!user) {
  return next(new AppError("User not found.", 401));
}
  



  req.user = user;

  next();
  } catch (err) {
next(new AppError("Invalid or expired token.", 401));
}

}

const verifyJWTParent =   async (req, res, next) => {
  try{
  const token = req.cookies?.schoolHubToken ||
(req.headers.authorization?.startsWith("Bearer")
? req.headers.authorization.split(" ")[1]
: null);
if (!token) {
  return next(new AppError("Not authorized. No token found.", 401));
}

 
 const decoded = jwt.verify(token, process.env.JWT_SECRET);
const user = await Parent.findById(decoded.id).select("-password");
if (!user) {
  return next(new AppError("User not found.", 401));
}
  



  req.user = user;

  next();
  } catch (err) {
next(new AppError("Invalid or expired token.", 401));
}

}

// Optional helper if you ever need routes that only parents (or only
// students) can hit, e.g. router.get("/x", verifyJWT, requireRole("parent"), ...)
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    throw new ApiError(403, "You don't have permission to access this resource");
  }
  next();
};


module.exports = { verifyJWTStudent, verifyJWTParent, requireRole };
