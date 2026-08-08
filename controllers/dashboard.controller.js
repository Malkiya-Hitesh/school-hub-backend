// controllers/dashboard.controller.js

const AppError = require("../utils/appError");
const { asyncHandler } = require("../utils/asyncHandler");

const {
  getSchoolByUserSchoolId,
  updateSchoolSectionService,
  updateAddressService,
  addToArrayService,
  updateArrayItemService,
  deleteArrayItemService,
  updateSocialService,
} = require("../services/dashboard.service");

// ─────────────────────────────────────────────
// School Core
// ─────────────────────────────────────────────

// GET /api/dashboard/school
const getMySchool = asyncHandler(async (req, res) => {
  const school = await getSchoolByUserSchoolId(req.user.schoolId);
  if (!school) throw new AppError("School not found", 404);

  res.json({ success: true, data: school });
});

// GET /api/dashboard/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const school = await getSchoolByUserSchoolId(req.user.schoolId);
  if (!school) throw new AppError("School not found", 404);

  res.json({
    success: true,
    data: {
      totalStudents: school.academics?.totalStudents || 0,
      totalTeachers: school.academics?.totalTeachers || 0,
      studentTeacherRatio: school.academics?.studentTeacherRatio ?? null,
      totalFacilities: school.facilities?.length || 0,
      totalAchievements: school.achievements?.length || 0,
      totalResults: school.results?.length || 0,
      profileCompletion: school.profile?.completion ?? 0,
      isVerified: !!school.verification?.isVerified,
    },
  });
});

// ─────────────────────────────────────────────
// Section Updates
// ─────────────────────────────────────────────

const makeSectionUpdater = (section, service = updateSchoolSectionService) =>
  asyncHandler(async (req, res) => {
    const school = await service(req.user.schoolId, section, req.body);
    if (!school) throw new AppError("School not found", 404);

    res.json({ success: true, data: school[section] });
  });

const updateBasics = makeSectionUpdater("basics");
const updateAbout = makeSectionUpdater("about"); // NEW — tagline/description/vision/mission/principalMessage
const updateAddress = asyncHandler(async (req, res) => {
  const school = await updateAddressService(req.user.schoolId, req.body);
  if (!school) throw new AppError("School not found", 404);

  res.json({ success: true, data: school.address });
});
const updateAcademics = makeSectionUpdater("academics");
const updateCategory = makeSectionUpdater("category");
const updateFees = makeSectionUpdater("fees");
const updateContact = makeSectionUpdater("contact");
const updateAdmission = makeSectionUpdater("admission");

// ─────────────────────────────────────────────
// Results CRUD
// ─────────────────────────────────────────────

const getResults = asyncHandler(async (req, res) => {
  const school = await getSchoolByUserSchoolId(req.user.schoolId);
  if (!school) throw new AppError("School not found", 404);

  res.json({ success: true, data: school.results });
});

const addResult = asyncHandler(async (req, res) => {
  const school = await addToArrayService(req.user.schoolId, "results", req.body);
  if (!school) throw new AppError("School not found", 404);

  res.status(201).json({ success: true, data: school.results });
});

const updateResult = asyncHandler(async (req, res) => {
  const result = await updateArrayItemService(
    req.user.schoolId,
    "results",
    req.params.resultId,
    req.body
  );
  if (!result) throw new AppError("School not found", 404);
  if (!result.item) throw new AppError("Result not found", 404);

  res.json({ success: true, data: result.item });
});

const deleteResult = asyncHandler(async (req, res) => {
  const result = await deleteArrayItemService(req.user.schoolId, "results", req.params.resultId);
  if (!result) throw new AppError("School not found", 404);
  if (!result.deleted) throw new AppError("Result not found", 404);

  res.json({ success: true, message: "Result deleted" });
});

// ─────────────────────────────────────────────
// Achievements CRUD
// ─────────────────────────────────────────────

const getAchievements = asyncHandler(async (req, res) => {
  const school = await getSchoolByUserSchoolId(req.user.schoolId);
  if (!school) throw new AppError("School not found", 404);

  res.json({ success: true, data: school.achievements });
});

const addAchievement = asyncHandler(async (req, res) => {
  const school = await addToArrayService(req.user.schoolId, "achievements", req.body);
  if (!school) throw new AppError("School not found", 404);

  res.status(201).json({ success: true, data: school.achievements });
});

const updateAchievement = asyncHandler(async (req, res) => {
  const result = await updateArrayItemService(
    req.user.schoolId,
    "achievements",
    req.params.achId,
    req.body
  );
  if (!result) throw new AppError("School not found", 404);
  if (!result.item) throw new AppError("Achievement not found", 404);

  res.json({ success: true, data: result.item });
});

const deleteAchievement = asyncHandler(async (req, res) => {
  const result = await deleteArrayItemService(
    req.user.schoolId,
    "achievements",
    req.params.achId
  );
  if (!result) throw new AppError("School not found", 404);
  if (!result.deleted) throw new AppError("Achievement not found", 404);

  res.json({ success: true, message: "Achievement deleted" });
});

// ─────────────────────────────────────────────
// Facilities CRUD
// ─────────────────────────────────────────────

const getFacilities = asyncHandler(async (req, res) => {
  const school = await getSchoolByUserSchoolId(req.user.schoolId);
  if (!school) throw new AppError("School not found", 404);

  res.json({ success: true, data: school.facilities });
});

const addFacility = asyncHandler(async (req, res) => {
  const school = await addToArrayService(req.user.schoolId, "facilities", req.body);
  if (!school) throw new AppError("School not found", 404);

  res.status(201).json({ success: true, data: school.facilities });
});

const updateFacility = asyncHandler(async (req, res) => {
  const result = await updateArrayItemService(
    req.user.schoolId,
    "facilities",
    req.params.facId,
    req.body
  );
  if (!result) throw new AppError("School not found", 404);
  if (!result.item) throw new AppError("Facility not found", 404);

  res.json({ success: true, data: result.item });
});

const deleteFacility = asyncHandler(async (req, res) => {
  const result = await deleteArrayItemService(
    req.user.schoolId,
    "facilities",
    req.params.facId
  );
  if (!result) throw new AppError("School not found", 404);
  if (!result.deleted) throw new AppError("Facility not found", 404);

  res.json({ success: true, message: "Facility deleted" });
});

// ─────────────────────────────────────────────
// Social Links (schema field: `social`)
// ─────────────────────────────────────────────

const getSocialLinks = asyncHandler(async (req, res) => {
  const school = await getSchoolByUserSchoolId(req.user.schoolId);
  if (!school) throw new AppError("School not found", 404);

  res.json({ success: true, data: school.social });
});

const replaceSocialLinks = asyncHandler(async (req, res) => {
  const school = await updateSocialService(req.user.schoolId, req.body);
  if (!school) throw new AppError("School not found", 404);

  res.json({ success: true, data: school.social });
});

module.exports = {
  getMySchool,
  getDashboardStats,

  updateBasics,
  updateAbout,
  updateAddress,
  updateAcademics,
  updateCategory,
  updateFees,
  updateContact,
  updateAdmission,

  getResults,
  addResult,
  updateResult,
  deleteResult,

  getAchievements,
  addAchievement,
  updateAchievement,
  deleteAchievement,

  getFacilities,
  addFacility,
  updateFacility,
  deleteFacility,

  getSocialLinks,
  replaceSocialLinks,
};