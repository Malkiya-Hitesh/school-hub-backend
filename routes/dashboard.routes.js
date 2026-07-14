const express = require("express");
const router = express.Router();

const {
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
} = require("../controllers/dashboard.controller");

const { protect } = require("../middleware/auth");

// All routes protected
router.use(protect);


// ── School ─────────────────────────────────────────

// Claim/register school
router.post("/school/register", registerSchool);

// Main school
router.get("/school", getMySchool);

// Dashboard stats
router.get("/stats", getDashboardStats);


// ── Section Updates ───────────────────────────────

router.patch("/school/basics", updateBasics);

router.patch("/school/address", updateAddress);

router.patch("/school/academics", updateAcademics);

router.patch("/school/category", updateCategory);

router.patch("/school/fees", updateFees);

router.patch("/school/contact", updateContact);


// ── Results CRUD ──────────────────────────────────

router.get("/school/results", getResults);

router.post("/school/results", addResult);

router.patch("/school/results/:resultId", updateResult);

router.delete("/school/results/:resultId", deleteResult);


// ── Achievements CRUD ─────────────────────────────

router.get("/school/achievements", getAchievements);

router.post("/school/achievements", addAchievement);

router.patch("/school/achievements/:achId", updateAchievement);

router.delete("/school/achievements/:achId", deleteAchievement);


// ── Facilities CRUD ───────────────────────────────

router.get("/school/facilities", getFacilities);

router.post("/school/facilities", addFacility);

router.patch("/school/facilities/:facId", updateFacility);

router.delete("/school/facilities/:facId", deleteFacility);


// ── Social Links ──────────────────────────────────

router.get("/school/social", getSocialLinks);

router.put("/school/social", replaceSocialLinks);


// ── UDISE Facility (read only) ────────────────────

router.get("/school/udise-facility", getUdiseFacility);

module.exports = router;