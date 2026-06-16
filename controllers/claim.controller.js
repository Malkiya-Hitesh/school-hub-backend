const School = require("../models/School");
const Claim = require("../models/SchoolClaim");
const generateOTP = require("../utils/otp");
const sendOTP = require("../utils/mailer");
const User = require("../models/User");



exports.searchSchool = async (req, res) => {
  try {
    let { last5 } = req.query;

    if (!last5) {
      return res.status(400).json({
        success: false,
        message: "last5 is required",
      });
    }

    last5 = String(last5).trim();

    const school = await School.findOne({
      udiseCode: { $regex: new RegExp(`${last5}$`) }
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    res.json({
      success: true,
      school,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


exports.initiateClaim = async (req, res) => {
  try {
    // userId body mathi nahi — JWT cookie mathi aave (protect middleware)
    
    const { schoolId, contactName, contactPhone, contactEmail,userId } = req.body;
    const otp = generateOTP();

    const claim = await Claim.create({
      userId,
      schoolId,
      name: contactName,
      phone: contactPhone,
      email: contactEmail,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      status: "draft",
    });

    await sendOTP(contactEmail, otp);

    const user = await User.findById(userId);
    if (user) {
      user.schoolId = schoolId;
      await user.save();
    }

    const school = await School.findById(schoolId);
    if (school) {
      school.adminInfo = {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        verified: false,
      };
      await school.save();
    }
    console.log("Claim initiated:", claim._id, "for school:", schoolId);
    res.json({
      success: true,
      message: "OTP sent successfully",
      claimId: claim._id,
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.verifyOTP = async (req, res) => {
  try {
    const { claimId, otp } = req.body;

    const claim = await Claim.findById(claimId);

    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found" });
    }

    if (claim.otp !== otp || claim.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    claim.emailVerified = true;
    claim.otp = null;
   const school = await School.findById(claim.schoolId);
    if (school) {
      school.adminInfo.verified = true;
      await school.save();
    }

    await claim.save();

    res.json({ success: true, message: "Email verified" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};





exports.submitClaim = async (req, res) => {
  try {
    const { claimId, documents } = req.body;

    const claim = await Claim.findById(claimId);

    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found" });
    }

    if (!claim.emailVerified) {
      return res.status(400).json({ success: false, message: "Email not verified" });
    }

    claim.documents = documents;
    claim.status = "pending";

    await claim.save();

    res.json({
      success: true,
      message: "Claim submitted for approval",
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};