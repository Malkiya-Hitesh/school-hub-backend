
const School = require("../models/School");
const Claim = require("../models/SchoolClaim");
const User = require("../models/User");

// Search school by last 5 UDISE digits
const findSchoolByLast5 = async (last5,e) => {
  return await School.find({
    udiseCode: {
      $regex: new RegExp(`${last5}$`),
    },
   "contact.email": e.toLowerCase().trim(),
  });
};

// Create claim
const createClaim = async ({
  userId,
  schoolId,
  contactName,
  contactPhone,
  contactEmail,
  otp,
}) => {
  return await Claim.create({
    userId,
    schoolId,
    name: contactName,
    phone: contactPhone,
    email: contactEmail,
    otp,
    otpExpires: Date.now() + 10 * 60 * 1000,
    status: "draft",
  });
};

// Find claim by id
const findClaimById = async (claimId) => {
  return await Claim.findById(claimId);
};

// Update user school link
const updateUserSchool = async (userId, schoolId) => {
  return await User.findByIdAndUpdate(userId, {
    schoolId,
  });
};

// Update school admin info
const updateSchoolAdminInfo = async ({
  schoolId,
  contactName,
  contactPhone,
  contactEmail,
  verified = false,
}) => {
  return await School.findByIdAndUpdate(schoolId, {
    adminInfo: {
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      verified,
    },
  });
};

module.exports = {
  findSchoolByLast5,
  createClaim,
  findClaimById,
  updateUserSchool,
  updateSchoolAdminInfo,
};