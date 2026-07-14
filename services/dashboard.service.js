const School = require("../models/School");

// ─────────────────────────────────────────────
// Core
// ─────────────────────────────────────────────

const getSchoolByUserSchoolId = async (schoolId) => {
  return await School.findById(schoolId);
};

const registerSchoolService = async (schoolId) => {
  return await School.findByIdAndUpdate(
    schoolId,
    {
      isClaimed: true,
    },
    {
      new: true,
    }
  );
};

// ─────────────────────────────────────────────
// Section Updates
// ─────────────────────────────────────────────

const updateSchoolSectionService = async (
  schoolId,
  section,
  data
) => {
  return await School.findByIdAndUpdate(
    schoolId,
    {
      $set: {
        [section]: data,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// ─────────────────────────────────────────────
// Array CRUD
// ─────────────────────────────────────────────

const addToArrayService = async (
  schoolId,
  field,
  data
) => {
  return await School.findByIdAndUpdate(
    schoolId,
    {
      $push: {
        [field]: data,
      },
    },
    {
      new: true,
    }
  );
};

const replaceArrayService = async (
  schoolId,
  field,
  data
) => {
  return await School.findByIdAndUpdate(
    schoolId,
    {
      $set: {
        [field]: data,
      },
    },
    {
      new: true,
    }
  );
};

module.exports = {
  getSchoolByUserSchoolId,
  registerSchoolService,
  updateSchoolSectionService,
  addToArrayService,
  replaceArrayService,
};

