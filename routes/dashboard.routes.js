// routes/dashboard.routes.js

const express = require("express");
const router = express.Router();

const {
  getMySchool,
  getDashboardStats,

  updateBasics,
  updateAbout,        // NEW — schema has basics/about as separate sub-objects
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
} = require("../controllers/dashboard.controller");

const { protect } = require("../middleware/auth");
const requireSchoolLinked = require("../middleware/requireSchoolLinked");

const {
  validateBasics,
  validateAddress,
  validateAcademics,
  validateCategory,
  validateFees,
  validateContact,
  validateResult,
  validateAchievement,
  validateFacility,
  validateSocial,
} = require("../validators/dashboard.validator");

// All dashboard routes require auth; all /school/* routes additionally
// require a linked school.
router.use(protect);

// Dashboard stats works with just auth (returns 404 via controller if no
// school — but keep the guard for a clearer error message).
router.get("/stats", requireSchoolLinked, getDashboardStats);

router.use("/school", requireSchoolLinked);

// ── Core ───────────────────────────────────────────
router.get("/school", getMySchool);

// ── Section Updates ───────────────────────────────
router.patch("/school/basics", validateBasics, updateBasics);
router.patch("/school/about", updateAbout); // tagline/description/vision/mission/principalMessage — free text, no validator needed
router.patch("/school/address", validateAddress, updateAddress);
router.patch("/school/academics", validateAcademics, updateAcademics);
router.patch("/school/category", validateCategory, updateCategory);
router.patch("/school/fees", validateFees, updateFees);
router.patch("/school/contact", validateContact, updateContact);
router.patch("/school/admission", updateAdmission);

// ── Results CRUD ──────────────────────────────────
router.get("/school/results", getResults);
router.post("/school/results", validateResult, addResult);
router.patch("/school/results/:resultId", updateResult);
router.delete("/school/results/:resultId", deleteResult);

// ── Achievements CRUD ─────────────────────────────
router.get("/school/achievements", getAchievements);
router.post("/school/achievements", validateAchievement, addAchievement);
router.patch("/school/achievements/:achId", updateAchievement);
router.delete("/school/achievements/:achId", deleteAchievement);

// ── Facilities CRUD (schema field: facilities → { label, description, imageUrl }) ──
router.get("/school/facilities", getFacilities);
router.post("/school/facilities", validateFacility, addFacility);
router.patch("/school/facilities/:facId", updateFacility);
router.delete("/school/facilities/:facId", deleteFacility);

// ── Social Links (schema field: social → flat object) ─────────
router.get("/school/social", getSocialLinks);
router.put("/school/social", validateSocial, replaceSocialLinks);

module.exports = router;