const AppError = require("../utils/appError");

const generateOTP = require("../utils/otp");
const sendOTP = require("../utils/mailer");

const {
  findSchoolByLast5,
  createClaim,
  findClaimById,
  updateUserSchool,
  updateSchoolAdminInfo,
} = require("../services/claim.service");

// STEP 1 — Search school
exports.searchSchool = async (req, res) => {
  try {
    let { last5 ,email} = req.query;

    if (!last5) {
      throw new AppError("last digits 5 is required", 400);
    }
    if (!email) {
     throw new AppError("email is required", 400);
    }

    last5 = String(last5).trim();


    const school = await findSchoolByLast5(last5,email);


    if (!school) {
      throw new AppError("School not found", 404);
    }

    res.json({
      success: true,
      school,
    });
  } catch (err) {
    throw new AppError(err.message, err.statusCode || 500);
  }
};

// STEP 2 — Initiate claim
exports.initiateClaim = async (req, res) => {
  try {
    const {
      schoolId,
      contactName,
      contactPhone,
      contactEmail,
      userId,
    } = req.body;

    const otp = generateOTP();

    const claim = await createClaim({
      userId,
      schoolId,
      contactName,
      contactPhone,
      contactEmail,
      otp,
    });

    await sendOTP(contactEmail, otp);

    await updateUserSchool(userId, schoolId);

    await updateSchoolAdminInfo({
      schoolId,
      contactName,
      contactPhone,
      contactEmail,
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
      claimId: claim._id,
    });
  } catch (err) {
    throw new AppError(err.message, err.statusCode || 500);
  }
};

// STEP 3 — Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { claimId, otp } = req.body;

    const claim = await findClaimById(claimId);

    if (!claim) {
      throw new AppError("Claim not found", 404);
    }

    if (claim.otp !== otp || claim.otpExpires < Date.now()) {
      throw new AppError("Invalid OTP", 400);
    }

    claim.emailVerified = true;
    claim.otp = null;

    await updateSchoolAdminInfo({
      schoolId: claim.schoolId,
      contactName: claim.name,
      contactPhone: claim.phone,
      contactEmail: claim.email,
      verified: true,
    });

    await claim.save();

    res.json({
      success: true,
      message: "Email verified",
    });
  } catch (err) {
    throw new AppError(err.message, err.statusCode || 500);
  }
};

// STEP 4 — Submit claim
exports.submitClaim = async (req, res) => {
  try {
    const { claimId, documents } = req.body;

    const claim = await findClaimById(claimId);

    if (!claim) {
      throw new AppError("Claim not found", 404);
    }

    if (!claim.emailVerified) {
      throw new AppError("Email not verified", 400);
    }

    claim.documents = documents;
    claim.status = "pending";

    await claim.save();

    res.json({
      success: true,
      message: "Claim submitted for approval",
    });
  } catch (err) {
    throw new AppError(err.message, err.statusCode || 500);
  }
};