const express = require("express");
const router = express.Router();

const {
  getSchools,
  getSchoolBySlug,
  getSchoolBySchoolId,
  getSchoolByMongoId,
  createSchool,
} = require("../controllers/school.controller");

const { validateSchoolQuery, validateCreateSchool } = require("../validators/school.validator");

router.get("/", validateSchoolQuery, getSchools);
router.post("/", validateCreateSchool, createSchool); // NEW — add your auth/admin middleware here before this ships
router.get("/slug/:slug", getSchoolBySlug);
router.get("/by-id/:schoolId", getSchoolBySchoolId);
router.get("/:id", getSchoolByMongoId);

module.exports = router;