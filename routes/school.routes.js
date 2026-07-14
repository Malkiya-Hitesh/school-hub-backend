const express = require("express");
const router = express.Router();

const {
  getSchools,
  getSchoolBySlug,
  getSchoolBySchoolId,
  getSchoolByMongoId,
} = require("../controllers/school.controller");

const { validateSchoolQuery } = require("../validators/school.validator");

router.get("/", validateSchoolQuery, getSchools);
router.get("/slug/:slug", getSchoolBySlug);
router.get("/by-id/:schoolId", getSchoolBySchoolId);
router.get("/:id", getSchoolByMongoId);

module.exports = router;