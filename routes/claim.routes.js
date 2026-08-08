// routes/claim.routes.js

const express = require("express");
const router = express.Router();

const {
  searchSchool,
  initiateClaim,
  verifyOTP,
  submitClaim,
  getMyClaim,
  listPending,
  approve,
  reject,
} = require("../controllers/claim.controller");

const { protect, requireRole } = require("../middleware/auth");

const {
  validateSearchSchool,
  validateInitiateClaim,
  validateVerifyOtp,
  validateSubmitClaim,
  validateClaimIdParam,
} = require("../validators/claim.validator");

// Public — search by UDISE last-5 digits
router.get("/search", validateSearchSchool, searchSchool);

// Authenticated school-admin claim flow
router.post("/initiate", protect, validateInitiateClaim, initiateClaim);
router.post("/verify-otp", protect, validateVerifyOtp, verifyOTP);
router.post("/submit", protect, validateSubmitClaim, submitClaim);
router.get("/me", protect, getMyClaim);

// Admin review
router.get("/admin/pending", protect, requireRole("superAdmin"), listPending);
router.post(
  "/admin/:claimId/approve",
  protect,
  requireRole("superAdmin"),
  validateClaimIdParam,
  approve
);
router.post(
  "/admin/:claimId/reject",
  protect,
  requireRole("superAdmin"),
  validateClaimIdParam,
  reject
);

module.exports = router;