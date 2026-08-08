// services/claim.service.js


const School = require("../models/School");
const Claim = require("../models/SchoolClaim");
const User = require("../models/User");
const { generateOTP, hashOTP, verifyOTPHash, OTP_TTL_MS, MAX_OTP_ATTEMPTS } = require("../utils/otp");

const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ─────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────

// Search for a school by the last 5 digits of its UDISE code. Returns only
// the fields a claimant needs to confirm "yes, this is my school" — never
// the full document.
const findSchoolByLast5 = async (last5 ,e) => {
  

  return await School.find({
    udiseCode: {
      $regex: new RegExp(`${last5}$`),
    },
   "contact.email": e.toLowerCase().trim(),
}
);
}

// ─────────────────────────────────────────────
// Claim lifecycle
// ─────────────────────────────────────────────

const findActiveClaimForUser = async (userId) => {
  return await Claim.findOne({
    userId,
    status: { $in: ["draft", "pending"] },
  });
};

const findActiveClaimForSchool = async (schoolId) => {
  return await Claim.findOne({
    schoolId,
    status: { $in: ["pending", "approved"] },
  });
};

const findClaimById = async (claimId) => {
  return await Claim.findById(claimId).select("+otpHash");
};

const findClaimByIdForUser = async (claimId, userId) => {
  return await Claim.findOne({ _id: claimId, userId }).select("+otpHash");
};

// Create (or reuse + refresh) a draft claim for this user+school and issue
// a fresh OTP.
const createOrRefreshClaim = async ({
  userId,
  schoolId,
  contactName,
  contactPhone,
  contactEmail,
}) => {
  const otp = generateOTP();
  const otpHash = hashOTP(otp);
  const otpExpires = new Date(Date.now() + OTP_TTL_MS);

  let claim = await Claim.findOne({
    userId,
    schoolId,
    status: { $in: ["draft", "pending"] },
  }).select("+otpHash");

  if (claim) {
    claim.name = contactName;
    claim.phone = contactPhone;
    claim.email = contactEmail;
    claim.otpHash = otpHash;
    claim.otpExpires = otpExpires;
    claim.otpAttempts = 0;
    claim.emailVerified = false;
    claim.status = "draft";
    await claim.save();
  } else {
    claim = await Claim.create({
      userId,
      schoolId,
      name: contactName,
      phone: contactPhone,
      email: contactEmail,
      otpHash,
      otpExpires,
      otpAttempts: 0,
      status: "draft",
    });
  }

  return { claim, otp };
};

// Verify the OTP for a claim. Returns { ok, reason? }.
const verifyClaimOtp = async (claim, otp) => {
  if (claim.emailVerified) {
    return { ok: true };
  }

  if (!claim.otpHash || !claim.otpExpires) {
    return { ok: false, reason: "No OTP was issued for this claim" };
  }

  if (claim.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return { ok: false, reason: "Too many incorrect attempts. Please request a new OTP." };
  }

  if (claim.otpExpires.getTime() < Date.now()) {
    return { ok: false, reason: "OTP has expired. Please request a new OTP." };
  }

  const matches = verifyOTPHash(otp, claim.otpHash);

  if (!matches) {
    claim.otpAttempts += 1;
    await claim.save();
    return { ok: false, reason: "Incorrect OTP" };
  }

  claim.emailVerified = true;
  claim.otpHash = undefined;
  claim.otpExpires = null;
  await claim.save();

  return { ok: true };
};

const submitClaimDocuments = async (claim) => {

  claim.status = "pending";
  claim.submittedAt = new Date();
  await claim.save();
  return claim;
};

const listPendingClaims = async () => {
  return await Claim.find({ status: "pending" })
    .populate("schoolId", "schoolId slug basics.schoolName udiseCode")
    .populate("userId", "name email")
    .sort({ submittedAt: 1 })
    .lean();
};

// Approve a claim: this is the ONLY place School.claim.* and User.schoolId
// get written. Uses the real schema paths that exist on School v2.
const approveClaim = async (claimId, adminUserId) => {
  const claim = await Claim.findById(claimId);
  if (!claim) return null;
  if (claim.status !== "pending") {
    const err = new Error("Only pending claims can be approved");
    err.statusCode = 400;
    throw err;
  }

  const alreadyClaimed = await School.findOne({
    _id: claim.schoolId,
    "claim.isClaimed": true,
  }).select("_id");

  if (alreadyClaimed) {
    const err = new Error("This school has already been claimed");
    err.statusCode = 409;
    throw err;
  }

  claim.status = "approved";
  claim.reviewedBy = adminUserId;
  claim.reviewedAt = new Date();
  await claim.save();

  await School.findByIdAndUpdate(claim.schoolId, {
    $set: {
      "claim.isClaimed": true,
      "claim.claimedBy": claim.userId,
      "claim.claimedAt": new Date(),
      "admission.adminContact": {
        name: claim.name,
        phone: claim.phone,
        email: claim.email,
      },
    },
  });

  await User.findByIdAndUpdate(claim.userId, { schoolId: claim.schoolId });

  return claim;
};

const rejectClaim = async (claimId, adminUserId, reason) => {
  const claim = await Claim.findById(claimId);
  if (!claim) return null;
  if (claim.status !== "pending") {
    const err = new Error("Only pending claims can be rejected");
    err.statusCode = 400;
    throw err;
  }

  claim.status = "rejected";
  claim.reviewedBy = adminUserId;
  claim.reviewedAt = new Date();
  claim.rejectionReason = reason || null;
  await claim.save();

  return claim;
};

module.exports = {
  findSchoolByLast5,
  findActiveClaimForUser,
  findActiveClaimForSchool,
  findClaimById,
  findClaimByIdForUser,
  createOrRefreshClaim,
  verifyClaimOtp,
  submitClaimDocuments,
  listPendingClaims,
  approveClaim,
  rejectClaim,
};