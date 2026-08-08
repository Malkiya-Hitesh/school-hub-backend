// controllers/claim.controller.js

const AppError = require("../utils/appError");
const { asyncHandler } = require("../utils/asyncHandler");
const sendOTP = require("../utils/mailer");

const {
  findSchoolByLast5,
  findActiveClaimForUser,
  findActiveClaimForSchool,
  findClaimByIdForUser,
  createOrRefreshClaim,
  verifyClaimOtp,
  submitClaimDocuments,
  listPendingClaims,
  approveClaim,
  rejectClaim,
} = require("../services/claim.service");
const User = require("../models/User");

// STEP 1 — Search school by last 5 UDISE digits (public)
const searchSchool = asyncHandler(async (req, res) => {
  const { last5 ,email } = req.query;
console.log(last5 , email);


  const school = await findSchoolByLast5(last5 , email);

console.log(school);

  if (!school) {
    throw new AppError("", 404);
  }

  if (school.claim?.isClaimed) {
    throw new AppError("This school has alrgggggggggggggggggggggggggggggggeady been claimed", 409);
  }

  res.json({ success: true, data: school });
});

// STEP 2 — Initiate claim (auth required) — creates/refreshes a draft claim
// and emails an OTP to the contact address provided.
const initiateClaim = asyncHandler(async (req, res) => {
  const { schoolId, contactName, contactPhone, contactEmail } = req.body;

  const alreadyClaimed = await findActiveClaimForSchool(schoolId);
  if (alreadyClaimed && String(alreadyClaimed.userId) !== String(req.user._id)) {
    throw new AppError("This school is already claimed or under review", 409);
  }

  const existingForUser = await findActiveClaimForUser(req.user._id);
  if (existingForUser && String(existingForUser.schoolId) !== String(schoolId)) {
    throw new AppError(
      "You already have an active claim hhhhhhhhhhhhhhhhhhhhhhhhin progress for a different school",
      409
    );
  }

  const { claim, otp } = await createOrRefreshClaim({
    userId: req.user._id,
    schoolId,
    contactName: contactName.trim(),
    contactPhone: contactPhone.trim(),
    contactEmail: contactEmail.trim().toLowerCase(),
  });

  await sendOTP(claim.email, otp);

  res.json({
    success: true,
    message: "OTP sent to the provided email",
    data: { claimId: claim._id },
  });
});

// STEP 3 — Verify OTP (auth required)
const verifyOTP = asyncHandler(async (req, res) => {
  const { claimId, otp } = req.body;

  const claim = await findClaimByIdForUser(claimId, req.user._id);
  if (!claim) {
    throw new AppError("Claim not found", 404);
  }

  const result = await verifyClaimOtp(claim, String(otp).trim());
  if (!result.ok) {
    throw new AppError(result.reason, 400);
  }

  res.json({ success: true, message: "Email verified" });
});

// STEP 4 — Submit claim documents for admin review (auth required)
const submitClaim = asyncHandler(async (req, res) => {
  const { claimId } = req.body;

  const claim = await findClaimByIdForUser(claimId, req.user._id);
  if (!claim) {
    throw new AppError("Claim not found", 404);
  }

  if (!claim.emailVerified) {
    throw new AppError("Email not verified yet", 400);
  }
   const user = await User.findById(req.user._id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
 user.schoolId = claim.schoolId;
  await user.save({ validateBeforeSave: false });

  await submitClaimDocuments(claim);

  res.json({ success: true, message: "Claim submitted for approval" });
});

// GET current user's claim status (auth required)
const getMyClaim = asyncHandler(async (req, res) => {
  const claim = await findActiveClaimForUser(req.user._id);

  res.json({ success: true, data: claim || null });
});

// ── Admin review (superAdmin only) ──────────────────────────

const listPending = asyncHandler(async (req, res) => {
  const claims = await listPendingClaims();
  res.json({ success: true, data: claims });
});

const approve = asyncHandler(async (req, res) => {
  const claim = await approveClaim(req.params.claimId, req.user._id);
  if (!claim) {
    throw new AppError("Claim not found", 404);
  }
  res.json({ success: true, message: "Claim approved", data: claim });
});

const reject = asyncHandler(async (req, res) => {
  const claim = await rejectClaim(req.params.claimId, req.user._id, req.body?.reason);
  if (!claim) {
    throw new AppError("Claim not found", 404);
  }
  res.json({ success: true, message: "Claim rejected", data: claim });
});

module.exports = {
  searchSchool,
  initiateClaim,
  verifyOTP,
  submitClaim,
  getMyClaim,
  listPending,
  approve,
  reject,
};