const express = require("express");
const router = express.Router();

const {
  searchSchool,
  initiateClaim,
  verifyOTP,
  submitClaim,
} = require("../controllers/claim.controller");

router.get("/search", searchSchool);

router.post("/initiate", initiateClaim);
router.post("/verify-otp", verifyOTP);
router.post("/submit", submitClaim);

module.exports = router;