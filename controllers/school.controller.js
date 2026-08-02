const AppError = require("../utils/appError");
const mongoose = require("mongoose");

const {
  getSchoolBySlugService,
  getSchoolBySchoolIdService,
  getSchoolByMongoIdService,
  getSchoolsService,
  createSchoolService,
} = require("../services/school.service");

const { parsePagination } = require("../utils/pagination");
const { buildFilter } = require("../helpers/buildFilters");
const { SORT_MAP } = require("../helpers/buildSort");
const { parseGeoParams } = require("../utils/geo");
const { LIST_PROJECTION } = require("../config/constants");

// GET /api/schools  (હવે district/medium/board + lat/lng બંને handle કરે)
const getSchools = async (req, res, next) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);

    const geo = parseGeoParams(req.query);

    // geo active હોય તો regex-based search, નહીં તો $text index
    const filter = buildFilter(req.query, { useTextIndex: !geo });

    const explicitSort = Boolean(req.query.sortBy);
    const sort = SORT_MAP[req.query.sortBy] || SORT_MAP.newest;

    // $text વાપર્યું હોય તો જ textScore meaningful — geo mode માં $text જ નથી, એટલે filter.$text ક્યારેય geo સાથે true નહીં હોય
    const sortQuery = filter.$text
      ? { score: { $meta: "textScore" }, ...sort }
      : sort;

    let projection = filter.$text
      ? { ...LIST_PROJECTION, score: { $meta: "textScore" } }
      : LIST_PROJECTION;

    if (geo) {
      projection = { ...projection, distanceMeters: 1 };
    }

    const { schools, total } = await getSchoolsService({
      filter,
      projection,
      sortQuery,
      skip,
      limit,
      geo,
      explicitSort,
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
    next(err);
  }
};

// GET /api/schools/slug/:slug
const getSchoolBySlug = async (req, res, next) => {
  try {
    const school = await getSchoolBySlugService(req.params.slug);
    if (!school) throw new AppError("School not found", 404);
    res.json({ success: true, data: school });
  } catch (err) {
    console.error("GET /slug error:", err.message);
    next(err);
  }
};

// GET /api/schools/by-id/:schoolId
const getSchoolBySchoolId = async (req, res, next) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    if (isNaN(schoolId)) throw new AppError("Invalid schoolId", 400);

    const school = await getSchoolBySchoolIdService(schoolId);
    if (!school) throw new AppError("School not found", 404);

    res.json({ success: true, data: school });
  } catch (err) {
    console.error("GET /by-id error:", err.message);
    next(err);
  }
};

// GET /api/schools/:id
const getSchoolByMongoId = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      throw new AppError("Invalid id", 400);
    }
    const school = await getSchoolByMongoIdService(req.params.id);
    if (!school) throw new AppError("School not found", 404);

    res.json({ success: true, data: school });
  } catch (err) {
    console.error("GET /:id error:", err.message);
    next(err);
  }
};

// POST /api/schools  (NEW)
// schoolId, slug, studentTeacherRatio, about.description, seo.* defaults,
// and profile.completion are all auto-generated — see models/School.js hook.
const createSchool = async (req, res, next) => {
  try {
    const school = await createSchoolService(req.body);
    res.status(201).json({ success: true, data: school });
  } catch (err) {
    // Duplicate key (schoolId / slug / udiseCode) → clean 409 instead of a raw 500
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return next(new AppError(`A school with this ${field} already exists`, 409));
    }
    // Mongoose validation errors (bad enum, missing required field, etc.) → 400
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors)
        .map((e) => e.message)
        .join(", ");
      return next(new AppError(message, 400));
    }
    console.error("POST /schools error:", err.message);
    next(err);
  }
};

module.exports = {
  getSchools,
  getSchoolBySlug,
  getSchoolBySchoolId,
  getSchoolByMongoId,
  createSchool,
};