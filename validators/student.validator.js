// src/validators/student.validator.js
//
// If your backend already uses express-validator or zod elsewhere, swap
// this out for consistency — the Mongoose schema still enforces these
// rules as a safety net either way. This is a dependency-free version so
// it drops in regardless of what validation lib the rest of the app uses.

const {
  GENDER,
  MEDIUM,
  STANDARDS,
  ACADEMIC_YEAR_REGEX,
} = require("../constants/academic.constants");
const mongoose = require("mongoose");

function validateStudent(body, { partial = false } = {}) {
  const errors = [];
  const {
    fullName,
    gender,
    dateOfBirth,
    currentStandard,
    medium,
    academicYear,
    address,
  } = body;

  const required = (val, label) => {
    if (!partial && (val === undefined || val === null || val === "")) {
      errors.push(`${label} is required`);
    }
  };

  required(fullName, "Full name");
  if (fullName !== undefined && fullName !== null && String(fullName).trim().length < 2) {
    errors.push("Full name must be at least 2 characters");
  }

  required(gender, "Gender");
  if (gender !== undefined && !GENDER.includes(gender)) {
    errors.push(`Gender must be one of: ${GENDER.join(", ")}`);
  }

  required(dateOfBirth, "Date of birth");
  if (dateOfBirth !== undefined && isNaN(Date.parse(dateOfBirth))) {
    errors.push("Date of birth must be a valid date");
  } else if (dateOfBirth !== undefined && new Date(dateOfBirth).getTime() >= Date.now()) {
    errors.push("Date of birth must be in the past");
  }

  required(currentStandard, "Current standard/class");
  if (currentStandard !== undefined && !STANDARDS.includes(currentStandard)) {
    errors.push(`Current standard must be one of: ${STANDARDS.join(", ")}`);
  }

  required(medium, "Medium");
  if (medium !== undefined && !MEDIUM.includes(medium)) {
    errors.push(`Medium must be one of: ${MEDIUM.join(", ")}`);
  }

  required(academicYear, "Academic year");
  if (academicYear !== undefined && !ACADEMIC_YEAR_REGEX.test(academicYear)) {
    errors.push("Academic year must look like 2025-26 or 2025-2026");
  }

  // Address block
  if (!partial && !address) {
    errors.push("Address (district, taluka, villageOrCity) is required");
  } else if (address) {
    required(address.district, "District");
    required(address.taluka, "Taluka");
    required(address.villageOrCity, "Village/City");
  }

  

  return errors;
}

module.exports = { validateStudent };
