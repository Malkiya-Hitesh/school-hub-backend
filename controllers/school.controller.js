const mongoose = require("mongoose");

const {
  getNearbySchoolsService,
  getSchoolBySlugService,
  getSchoolBySchoolIdService,
  getSchoolByMongoIdService,
  getSchoolsService,
} = require("../services/school.service");

const { parsePagination } = require("../utils/pagination");
const { buildFilter } = require("../helpers/buildFilters");
const { SORT_MAP } = require("../helpers/buildSort");
const { LIST_PROJECTION } = require("../config/constants");


// GET /api/schools
const getSchools = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const filter = buildFilter(req.query);

    const sort = SORT_MAP[req.query.sortBy] || SORT_MAP.newest;

    const sortQuery = filter.$text
      ? { score: { $meta: "textScore" }, ...sort }
      : sort;

    const projection = filter.$text
      ? { ...LIST_PROJECTION, score: { $meta: "textScore" } }
      : LIST_PROJECTION;

    const { schools, total } = await getSchoolsService({
      filter,
      projection,
      sortQuery,
      skip,
      limit,
    });

    res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      count: schools.length,
      data: schools,
    });
  } catch (err) {
    console.error("GET /schools error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// GET /api/schools/nearby
const getNearbySchools = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    const radius = Math.min(
      50,
      parseFloat(req.query.radius) || 10
    );

    const limit = Math.min(
      20,
      parseInt(req.query.limit) || 10
    );

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "lat and lng are required",
      });
    }

    const schools = await getNearbySchoolsService({
      lat,
      lng,
      radius,
      limit,
      projection: LIST_PROJECTION,
    });

    res.json({
      success: true,
      count: schools.length,
      data: schools,
    });
  } catch (err) {
    console.error("GET /nearby error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// GET /api/schools/slug/:slug
const getSchoolBySlug = async (req, res) => {
  try {
    const school = await getSchoolBySlugService(req.params.slug);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    res.json({
      success: true,
      data: school,
    });
  } catch (err) {
    console.error("GET /slug error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// GET /api/schools/by-id/:schoolId
const getSchoolBySchoolId = async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);

    if (isNaN(schoolId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid schoolId",
      });
    }

    const school = await getSchoolBySchoolIdService(schoolId);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    res.json({
      success: true,
      data: school,
    });
  } catch (err) {
    console.error("GET /by-id error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// GET /api/schools/:id
const getSchoolByMongoId = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid id",
      });
    }

    const school = await getSchoolByMongoIdService(req.params.id);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    res.json({
      success: true,
      data: school,
    });
  } catch (err) {
    console.error("GET /:id error:", err.message);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getSchools,
  getNearbySchools,
  getSchoolBySlug,
  getSchoolBySchoolId,
  getSchoolByMongoId,
};