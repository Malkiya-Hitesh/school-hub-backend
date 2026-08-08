// validators/claim.validator.js

const mongoose = require("mongoose");
const AppError = require("../utils/appError");

const isObjectId = (v) => mongoose.Types.ObjectId.isValid(v);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s]{7,15}$/;

const validateSearchSchool = (req, res, next) => {
  const { last5 } = req.query;

  if (!last5 || !/^\d{5}$/.test(String(last5).trim())) {
    return next(new AppError("last5 must be the 5-digit UDISE suffix", 400));
  }

  next();
};

const validateInitiateClaim = (req, res, next) => {
  const { schoolId, contactName, contactPhone, contactEmail } = req.body;

  if (!schoolId || !isObjectId(schoolId)) {
    return next(new AppError("A valid schoolId is required", 400));
  }
  if (!contactName?.trim()) {
    return next(new AppError("contactName is required", 400));
  }
  if (!contactPhone?.trim() || !PHONE_RE.test(contactPhone.trim())) {
    return next(new AppError("A valid contactPhone is required", 400));
  }
  if (!contactEmail?.trim() || !EMAIL_RE.test(contactEmail.trim())) {
    return next(new AppError("A valid contactEmail is required", 400));
  }

  next();
};

const validateVerifyOtp = (req, res, next) => {
  const { claimId, otp } = req.body;

  if (!claimId || !isObjectId(claimId)) {
    return next(new AppError("A valid claimId is required", 400));
  }
  if (!otp || !/^\d{6}$/.test(String(otp).trim())) {
    return next(new AppError("A valid 6-digit otp is required", 400));
  }

  next();
};

const validateSubmitClaim = (req, res, next) => {
  const { claimId } = req.body;

  if (!claimId || !isObjectId(claimId)) {
    return next(new AppError("A valid claimId is required", 400));
  }
  
  

  next();
};

const validateClaimIdParam = (req, res, next) => {
  if (!isObjectId(req.params.claimId)) {
    return next(new AppError("Invalid claim id", 400));
  }
  next();
};

module.exports = {
  validateSearchSchool,
  validateInitiateClaim,
  validateVerifyOtp,
  validateSubmitClaim,
  validateClaimIdParam,
};