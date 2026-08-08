// services/dashboard.service.js

const School = require("../models/School");

// ─────────────────────────────────────────────
// Core
// ─────────────────────────────────────────────

const getSchoolByUserSchoolId = async (schoolId) => {
  return await School.findById(schoolId).lean();
};

const getSchoolDocument = async (schoolId) => {
  return await School.findById(schoolId);
};

// ─────────────────────────────────────────────
// Section Updates (merge, not replace — then .save() to run schema hooks)
// ─────────────────────────────────────────────

const mergeSection = (target = {}, patch = {}) => {
  const merged = { ...(target?.toObject ? target.toObject() : target) };
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) merged[key] = value;
  }
  return merged;
};

const updateSchoolSectionService = async (schoolId, section, data) => {
  const school = await School.findById(schoolId);
  if (!school) return null;

  school[section] = mergeSection(school[section], data);
  await school.save();
  return school;
};

// address.geo needs a slightly deeper merge since it's itself nested one
// level further (address.geo.coordinates / address.geo.googleMapsUrl).
const updateAddressService = async (schoolId, data) => {
  const school = await School.findById(schoolId);
  if (!school) return null;

  const { geo, ...rest } = data;
  school.address = mergeSection(school.address, rest);
  if (geo) {
    school.address.geo = mergeSection(school.address?.geo, geo);
  }

  await school.save();
  return school;
};

// ─────────────────────────────────────────────
// Array CRUD (results / achievements / facilities)
// ─────────────────────────────────────────────

const addToArrayService = async (schoolId, field, data) => {
  const school = await School.findById(schoolId);
  if (!school) return null;

  school[field].push(data);
  await school.save();
  return school;
};

const updateArrayItemService = async (schoolId, field, itemId, data) => {
  const school = await School.findById(schoolId);
  if (!school) return null;

  const item = school[field].id(itemId);
  if (!item) return { school, item: null };

  Object.assign(item, data);
  await school.save();
  return { school, item };
};

const deleteArrayItemService = async (schoolId, field, itemId) => {
  const school = await School.findById(schoolId);
  if (!school) return null;

  const item = school[field].id(itemId);
  if (!item) return { school, deleted: false };

  school[field].pull(itemId);
  await school.save();
  return { school, deleted: true };
};

// ─────────────────────────────────────────────
// Social links (schema field is `social`, not `socialLinks`)
// ─────────────────────────────────────────────

const updateSocialService = async (schoolId, data) => {
  return await updateSchoolSectionService(schoolId, "social", data);
};

module.exports = {
  getSchoolByUserSchoolId,
  getSchoolDocument,
  updateSchoolSectionService,
  updateAddressService,
  addToArrayService,
  updateArrayItemService,
  deleteArrayItemService,
  updateSocialService,
};