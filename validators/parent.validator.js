// src/validators/parent.validator.js
const { RELATION, MOBILE_REGEX } = require("../constants/academic.constants");

function validateParentPayload(body, { partial = false } = {}) {
  const errors = [];
  const { fullName, relation, mobileNumber, email, address } = body;

  const required = (val, label) => {
    if (!partial && (val === undefined || val === null || val === "")) {
      errors.push(`${label} is required`);
    }
  };

  required(fullName, "Parent full name");
  if (fullName !== undefined && String(fullName).trim().length < 2) {
    errors.push("Parent full name must be at least 2 characters");
  }

  required(relation, "Relation with student");
  if (relation !== undefined && !RELATION.includes(relation)) {
    errors.push(`Relation must be one of: ${RELATION.join(", ")}`);
  }

  required(mobileNumber, "Mobile number");
  if (mobileNumber !== undefined && !MOBILE_REGEX.test(mobileNumber)) {
    errors.push("Mobile number must be a valid 10-digit Indian number");
  }

  if (email) {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailOk) errors.push("Email must be a valid email address");
  }

  if (!partial && !address) {
    errors.push("Address (district, taluka, villageOrCity) is required");
  } else if (address) {
    required(address.district, "District");
    required(address.taluka, "Taluka");
    required(address.villageOrCity, "Village/City");
  }

  return errors;
}

module.exports = { validateParentPayload };
