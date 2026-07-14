const AppError = require("../utils/appError");

const {
  getSchoolByUserSchoolId,
  registerSchoolService,
  updateSchoolSectionService,
  addToArrayService,
  replaceArrayService,
} = require("../services/dashboard.service");

// ─────────────────────────────────────────────
// School Core
// ─────────────────────────────────────────────

// POST /api/dashboard/school/register
const registerSchool = async (req, res) => {
  try {
    const school = await getSchoolByUserSchoolId(
      req.body.schoolId
    );

    if (!school) {
      throw new AppError("School not found", 404);
    }

    req.user.schoolId = school._id;
    await req.user.save();

    await registerSchoolService(school._id);

    res.json({
      success: true,
      message: "School registered successfully",
    });
  } catch (err) {
    throw new AppError(err.message, 500);
  }
};

// GET /api/dashboard/school
const getMySchool = async (req, res) => {
  try {
    const school = await getSchoolByUserSchoolId(
      req.user.schoolId
    );

    if (!school) {
      throw new AppError("School not found", 404);
    }

    res.json({
      success: true,
      data: school,
    });
  } catch (err) {
    throw new AppError(err.message, 500);
  }
};

// GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const school = await getSchoolByUserSchoolId(
      req.user.schoolId
    );

    if (!school) {
      throw new AppError("School not found", 404);
    }

    res.json({
      success: true,
      data: {
        totalStudents: school.academics?.totalStudents || 0,
        totalTeachers: school.academics?.totalTeachers || 0,
        totalFacilities: school.facilities?.length || 0,
        totalAchievements:
          school.achievements?.length || 0,
        totalResults: school.results?.length || 0,
      },
    });
  } catch (err) {
    throw new AppError(err.message, 500);
  }
};

// ─────────────────────────────────────────────
// Section Updates
// ─────────────────────────────────────────────

const updateBasics = async (req, res) => {
  try {
    const school = await updateSchoolSectionService(
      req.user.schoolId,
      "basics",
      req.body
    );

    res.json({
      success: true,
      data: school.basics,
    });
  } catch (err) {
    throw new AppError(err.message, 500);
  }
};

const updateAddress = async (req, res) => {
  try {
    const school = await updateSchoolSectionService(
      req.user.schoolId,
      "address",
      req.body
    );

    res.json({
      success: true,
      data: school.address,
    });
  } catch (err) {
    throw new AppError(err.message, 500);
  }
};

const updateAcademics = async (req, res) => {
  try {
    const school = await updateSchoolSectionService(
      req.user.schoolId,
      "academics",
      req.body
    );

    res.json({
      success: true,
      data: school.academics,
    });
  } catch (err) {
    throw new AppError(err.message, 500);
  }
};

const updateCategory = async (req, res) => {
  try {
    const school = await updateSchoolSectionService(
      req.user.schoolId,
      "category",
      req.body
    );

    res.json({
      success: true,
      data: school.category,
    });
  } catch (err) {
    throw new AppError(err.message, 500);
  }
};

const updateFees = async (req, res) => {
  try {
    const school = await updateSchoolSectionService(
      req.user.schoolId,
      "fees",
      req.body
    );

    res.json({
      success: true,
      data: school.fees,
    });
  } catch (err) {
    throw new AppError(err.message, 500);
  }
};

const updateContact = async (req, res) => {
  try {
    const school = await updateSchoolSectionService(
      req.user.schoolId,
      "adminInfo",
      req.body
    );

    res.json({
      success: true,
      data: school.adminInfo,
    });
  } catch (err) {
    throw new AppError(err.message, 500);
  }
};

// ─────────────────────────────────────────────
// Results CRUD
// ─────────────────────────────────────────────

const getResults = async (req, res) => {
  const school = await getSchoolByUserSchoolId(
    req.user.schoolId
  );

  res.json({
    success: true,
    data: school.results,
  });
};

const addResult = async (req, res) => {
  const school = await addToArrayService(
    req.user.schoolId,
    "results",
    req.body
  );

  res.json({
    success: true,
    data: school.results,
  });
};

const updateResult = async (req, res) => {
  const school = await getSchoolByUserSchoolId(
    req.user.schoolId
  );

  const result = school.results.id(req.params.resultId);

  if (!result) {
    throw new AppError("Result not found", 404);
  }

  Object.assign(result, req.body);

  await school.save();

  res.json({
    success: true,
    data: result,
  });
};

const deleteResult = async (req, res) => {
  const school = await getSchoolByUserSchoolId(
    req.user.schoolId
  );

  school.results.pull(req.params.resultId);

  await school.save();

  res.json({
    success: true,
    message: "Result deleted",
  });
};

// ─────────────────────────────────────────────
// Achievements CRUD
// ─────────────────────────────────────────────

const getAchievements = async (req, res) => {
  const school = await getSchoolByUserSchoolId(
    req.user.schoolId
  );

  res.json({
    success: true,
    data: school.achievements,
  });
};

const addAchievement = async (req, res) => {
  const school = await addToArrayService(
    req.user.schoolId,
    "achievements",
    req.body
  );

  res.json({
    success: true,
    data: school.achievements,
  });
};

const updateAchievement = async (req, res) => {
  const school = await getSchoolByUserSchoolId(
    req.user.schoolId
  );

  const achievement = school.achievements.id(
    req.params.achId
  );

  if (!achievement) {
    throw new AppError("Achievement not found", 404);
  }

  Object.assign(achievement, req.body);

  await school.save();

  res.json({
    success: true,
    data: achievement,
  });
};

const deleteAchievement = async (req, res) => {
  const school = await getSchoolByUserSchoolId(
    req.user.schoolId
  );

  school.achievements.pull(req.params.achId);

  await school.save();

  res.json({
    success: true,
    message: "Achievement deleted",
  });
};

// ─────────────────────────────────────────────
// Facilities CRUD
// ─────────────────────────────────────────────

const getFacilities = async (req, res) => {
  const school = await getSchoolByUserSchoolId(
    req.user.schoolId
  );

  res.json({
    success: true,
    data: school.facilities,
  });
};

const addFacility = async (req, res) => {
  const school = await addToArrayService(
    req.user.schoolId,
    "facilities",
    req.body
  );

  res.json({
    success: true,
    data: school.facilities,
  });
};

const updateFacility = async (req, res) => {
  const school = await getSchoolByUserSchoolId(
    req.user.schoolId
  );

  const facility = school.facilities.id(
    req.params.facId
  );

  if (!facility) {
    throw new AppError("Facility not found", 404);
  }

  Object.assign(facility, req.body);

  await school.save();

  res.json({
    success: true,
    data: facility,
  });
};

const deleteFacility = async (req, res) => {
  const school = await getSchoolByUserSchoolId(
    req.user.schoolId
  );

  school.facilities.pull(req.params.facId);

  await school.save();

  res.json({
    success: true,
    message: "Facility deleted",
  });
};

// ─────────────────────────────────────────────
// Social Links
// ─────────────────────────────────────────────

const getSocialLinks = async (req, res) => {
  const school = await getSchoolByUserSchoolId(
    req.user.schoolId
  );

  res.json({
    success: true,
    data: school.socialLinks,
  });
};

const replaceSocialLinks = async (req, res) => {
  const school = await replaceArrayService(
    req.user.schoolId,
    "socialLinks",
    req.body
  );

  res.json({
    success: true,
    data: school.socialLinks,
  });
};

// ─────────────────────────────────────────────
// UDISE Facility (read-only)
// ─────────────────────────────────────────────

const getUdiseFacility = async (req, res) => {
  const school = await getSchoolByUserSchoolId(
    req.user.schoolId
  );

  res.json({
    success: true,
    data: school.facility,
  });
};

module.exports = {
  registerSchool,
  getMySchool,
  getDashboardStats,

  updateBasics,
  updateAddress,
  updateAcademics,
  updateCategory,
  updateFees,
  updateContact,

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

  getUdiseFacility,
};