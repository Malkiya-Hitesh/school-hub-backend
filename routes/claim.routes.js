const express = require("express");
const router = express.Router();

const {
  searchSchool,
  initiateClaim,
  verifyOTP,
  submitClaim
} = require("../controllers/claim.controller");

// Step 1
router.get("/search", searchSchool);

// Step 2
router.post("/initiate", initiateClaim);

// Step 3
router.post("/verify-otp", verifyOTP);

// Step 4
router.post("/submit", submitClaim);

module.exports = router;