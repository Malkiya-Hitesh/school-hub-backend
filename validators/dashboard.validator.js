// validators/dashboard.validator.js

const AppError = require("../utils/appError");
const {
  DISTRICTS,
  MEDIUMS,
  BOARDS,
  STREAMS,
  MANAGEMENTS,
  SCHOOL_TYPES,
  LOCATION_TYPES,
} = require("../helpers/filterOptions");

const isNonEmptyString = (v) => typeof v === "string" && v.trim().length > 0;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const enumCheck = (value, allowed, label, next) => {
  if (value === undefined || value === null || value === "") return true;
  if (!allowed.includes(value)) {
    next(new AppError(`Invalid ${label}: ${value}`, 400));
    return false;
  }
  return true;
};

const validateBasics = (req, res, next) => {
  const { schoolName, establishedYear } = req.body;

  if (schoolName !== undefined && !isNonEmptyString(schoolName)) {
    return next(new AppError("schoolName cannot be empty", 400));
  }
  if (
    establishedYear !== undefined &&
    establishedYear !== null &&
    (!Number.isInteger(establishedYear) ||
      establishedYear < 1800 ||
      establishedYear > new Date().getFullYear())
  ) {
    return next(new AppError("Invalid establishedYear", 400));
  }

  next();
};

const validateAddress = (req, res, next) => {
  const { district, geo, pincode } = req.body;

  if (!enumCheck(district, DISTRICTS, "district", next)) return;

  if (pincode !== undefined && pincode !== null && pincode !== "") {
    if (!/^\d{6}$/.test(String(pincode).trim())) {
      return next(new AppError("pincode must be 6 digits", 400));
    }
  }

  if (geo?.coordinates !== undefined) {
    const c = geo.coordinates;
    if (
      !Array.isArray(c) ||
      c.length !== 2 ||
      typeof c[0] !== "number" ||
      typeof c[1] !== "number" ||
      c[0] < -180 ||
      c[0] > 180 ||
      c[1] < -90 ||
      c[1] > 90
    ) {
      return next(
        new AppError("geo.coordinates must be [longitude, latitude] numbers", 400)
      );
    }
  }

  next();
};

const validateAcademics = (req, res, next) => {
  const { board, medium, streams, gradeFrom, gradeTo, totalStudents, totalTeachers } =
    req.body;

  for (const b of board || []) {
    if (!enumCheck(b, BOARDS, "board", next)) return;
  }
  for (const m of medium || []) {
    if (!enumCheck(m, MEDIUMS, "medium", next)) return;
  }
  for (const s of streams || []) {
    if (!enumCheck(s, STREAMS, "stream", next)) return;
  }

  if (gradeFrom !== undefined && gradeFrom !== null && (gradeFrom < 0 || gradeFrom > 12)) {
    return next(new AppError("gradeFrom must be between 0 and 12", 400));
  }
  if (gradeTo !== undefined && gradeTo !== null && (gradeTo < 1 || gradeTo > 12)) {
    return next(new AppError("gradeTo must be between 1 and 12", 400));
  }
  if (totalStudents !== undefined && totalStudents !== null && totalStudents < 0) {
    return next(new AppError("totalStudents cannot be negative", 400));
  }
  if (totalTeachers !== undefined && totalTeachers !== null && totalTeachers < 0) {
    return next(new AppError("totalTeachers cannot be negative", 400));
  }

  next();
};

const validateCategory = (req, res, next) => {
  const { management, schoolType, locationType } = req.body;

  if (!enumCheck(management, MANAGEMENTS, "management", next)) return;
  if (!enumCheck(schoolType, SCHOOL_TYPES, "schoolType", next)) return;
  if (!enumCheck(locationType, LOCATION_TYPES, "locationType", next)) return;

  next();
};

const validateFees = (req, res, next) => {
  const fields = ["minTuitionFees", "maxTuitionFees", "transportFees", "hostelFees", "otherFees"];

  for (const f of fields) {
    const v = req.body[f];
    if (v !== undefined && v !== null && (typeof v !== "number" || v < 0)) {
      return next(new AppError(`${f} must be a non-negative number`, 400));
    }
  }

  if (
    req.body.minTuitionFees != null &&
    req.body.maxTuitionFees != null &&
    req.body.minTuitionFees > req.body.maxTuitionFees
  ) {
    return next(new AppError("minTuitionFees cannot exceed maxTuitionFees", 400));
  }

  next();
};

const validateContact = (req, res, next) => {
  const { email, phone, website } = req.body;

  if (email !== undefined && email !== null && email !== "" && !EMAIL_RE.test(email)) {
    return next(new AppError("Invalid contact email", 400));
  }
  if (phone !== undefined && !Array.isArray(phone)) {
    return next(new AppError("phone must be an array of numbers", 400));
  }
  if (website !== undefined && website !== null && website !== "") {
    if (!/^https?:\/\//i.test(website)) {
      return next(new AppError("website must be a valid URL", 400));
    }
  }

  next();
};

const validateResult = (req, res, next) => {
  const { classLabel, year, appeared, passed } = req.body;

  if (!isNonEmptyString(classLabel)) {
    return next(new AppError("classLabel is required", 400));
  }
  if (!Number.isInteger(year)) {
    return next(new AppError("year is required", 400));
  }
  if (appeared !== undefined && passed !== undefined && passed > appeared) {
    return next(new AppError("passed cannot exceed appeared", 400));
  }

  next();
};

const validateAchievement = (req, res, next) => {
  if (!isNonEmptyString(req.body.title)) {
    return next(new AppError("title is required", 400));
  }
  next();
};

const validateFacility = (req, res, next) => {
  if (!isNonEmptyString(req.body.label)) {
    return next(new AppError("label is required", 400));
  }
  next();
};

const validateSocial = (req, res, next) => {
  const urlFields = ["facebook", "instagram", "youtube", "linkedin", "twitter", "telegram", "whatsappChannel"];
  for (const f of urlFields) {
    const v = req.body[f];
    if (v !== undefined && v !== null && v !== "" && !/^https?:\/\//i.test(v)) {
      return next(new AppError(`${f} must be a valid URL`, 400));
    }
  }
  next();
};
const validateAbout = (req, res, next) => {
  const { tagline, description, vision, mission, principalMessage } = req.body;
  const fields = { tagline, description, vision, mission, principalMessage };
  for (const [key, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null && typeof v !== "string") {
      return next(new AppError(`${key} must be a string`, 400));
    }
  }
  next();
};

const validateAdmission = (req, res, next) => {
  const { isOpen, onlineAvailable, startDate, endDate, admissionUrl, adminContact, documentsRequired } = req.body;

  if (isOpen !== undefined && typeof isOpen !== "boolean") {
    return next(new AppError("isOpen must be boolean", 400));
  }
  if (onlineAvailable !== undefined && typeof onlineAvailable !== "boolean") {
    return next(new AppError("onlineAvailable must be boolean", 400));
  }
  if (startDate && isNaN(Date.parse(startDate))) {
    return next(new AppError("Invalid startDate", 400));
  }
  if (endDate && isNaN(Date.parse(endDate))) {
    return next(new AppError("Invalid endDate", 400));
  }
  if (admissionUrl && !/^https?:\/\//i.test(admissionUrl)) {
    return next(new AppError("admissionUrl must be a valid URL", 400));
  }
  if (adminContact?.email && !EMAIL_RE.test(adminContact.email)) {
    return next(new AppError("Invalid adminContact email", 400));
  }
  if (documentsRequired !== undefined && !Array.isArray(documentsRequired)) {
    return next(new AppError("documentsRequired must be an array", 400));
  }

  next();
};

module.exports = {
  validateBasics,
  validateAbout,
  validateAddress,
  validateAcademics,
  validateCategory,
  validateFees,
  validateContact,
  validateAdmission,
  validateResult,
  validateAchievement,
  validateFacility,
  validateSocial,
};