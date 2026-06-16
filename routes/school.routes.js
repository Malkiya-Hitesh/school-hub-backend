// routes/schools.js
const express = require("express");
const router  = express.Router();
const mongoose = require("mongoose");
const School  = require("../models/School");
const { DISTRICTS, DISTRICT_TALUKAS, MEDIUMS, BOARDS,
  MANAGEMENTS, SCHOOL_TYPES, LOCATION_TYPES,
  CATEGORY_TYPES, GRADE_FROM, GRADE_TO,
} = require("../config/filterOptions");

// ─── Constants ───────────────────────────────────────────────
const DEFAULT_LIMIT = 20;
const MAX_LIMIT     = 100;

// ─── List Projection ────────────────────────────────────────
// Only selected fields returned in list/search endpoints
// Jyare 2+ schools mange tyare aa projection j aavse — full data nahi
const LIST_PROJECTION = {
  _id:                      1,
  schoolId:                 1,
  slug:                     1,
  status:                   1,
  isClaimed:                1,
  isVerified:               1,
  // basics — important display fields only
  "basics.schoolName":      1,
  "basics.logoImg":         1,
  "basics.description":     1,
  "basics.trustName":       1,
  "basics.phone":           1,
  "basics.email":           1,
  "basics.website":         1,
  // address
  "address.village":        1,
  "address.taluka":         1,
  "address.district":       1,
  "address.state":          1,
  "address.googleMapsUrl":  1,
  // category
  "category.type":          1,
  "category.management":    1,
  "category.locationType":  1,
  "category.schoolType":    1,
  // academics — key fields
  "academics.gradeFrom":    1,
  "academics.gradeTo":      1,
  "academics.medium":       1,
  "academics.board":        1,
  "academics.totalStudents":1,
  // meta
  "meta.seo":               1,
  "meta.search.boostScore": 1,
};

// ─── Sort Map ────────────────────────────────────────────────
const SORT_MAP = {
  students: { "academics.totalStudents": -1 },
  name:     { "basics.schoolName": 1 },
  district: { "address.district": 1 },
  newest:   { createdAt: -1 },
};

// ─── Helpers ─────────────────────────────────────────────────

const parsePagination = (query) => {
  const page  = Math.max(1, parseInt(query.page)  || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit) || DEFAULT_LIMIT));
  const skip  = (page - 1) * limit;
  return { page, limit, skip };
};

const buildFilter = (query) => {
  const filter = {};

  // Only active schools
  filter.status = "active";

  // Full-text search
  if (query.q?.trim()) {
    filter.$text = { $search: query.q.trim() };
  }

  // District — exact match from enum list
  if (query.district && DISTRICTS.includes(query.district)) {
    filter["address.district"] = query.district;
  }

  // Taluka — validate against district if both provided
  if (query.taluka) {
    const taluka = query.taluka.trim().toUpperCase();
    if (query.district && DISTRICT_TALUKAS[query.district]) {
      // Only allow valid talukas for that district
      if (DISTRICT_TALUKAS[query.district].includes(taluka)) {
        filter["address.taluka"] = { $regex: `^${taluka}$`, $options: "i" };
      }
    } else {
      filter["address.taluka"] = { $regex: query.taluka.trim(), $options: "i" };
    }
  }

  // Village — partial match
  if (query.village) {
    filter["address.village"] = { $regex: query.village.trim(), $options: "i" };
  }

  // Medium — must be from enum list
  if (query.medium && MEDIUMS.includes(query.medium)) {
    filter["academics.medium"] = { $in: [query.medium] };
  }

  // Board — must be from enum list
  if (query.board && BOARDS.includes(query.board)) {
    filter["academics.board"] = { $in: [query.board] };
  }

  // Management — must be from enum list
  if (query.management && MANAGEMENTS.includes(query.management)) {
    filter["category.management"] = query.management;
  }

  // School type
  if (query.schoolType && SCHOOL_TYPES.includes(query.schoolType)) {
    filter["category.schoolType"] = query.schoolType;
  }

  // Location type
  if (query.locationType && LOCATION_TYPES.includes(query.locationType)) {
    filter["category.locationType"] = query.locationType;
  }

  // Category type
  if (query.categoryType && CATEGORY_TYPES.includes(query.categoryType)) {
    filter["category.type"] = query.categoryType;
  }

  // Grade range — gradeFrom <= requested, gradeTo >= requested
  if (query.gradeFrom !== undefined) {
    const gf = Number(query.gradeFrom);
    if (!isNaN(gf) && GRADE_FROM.includes(gf)) {
      filter["academics.gradeFrom"] = { $lte: gf };
    }
  }
  if (query.gradeTo !== undefined) {
    const gt = Number(query.gradeTo);
    if (!isNaN(gt) && GRADE_TO.includes(gt)) {
      filter["academics.gradeTo"] = { $gte: gt };
    }
  }

  // Claimed / Verified filters
  if (query.isClaimed === "true")  filter.isClaimed  = true;
  if (query.isVerified === "true") filter.isVerified = true;

  return filter;
};

// ─── Routes ──────────────────────────────────────────────────



// ── GET /api/schools/nearby?lat=22.45&lng=71.20&radius=10
// Returns nearby active schools using 2dsphere geo index
router.get("/nearby", async (req, res) => {
  try {
    const lat    = parseFloat(req.query.lat);
    const lng    = parseFloat(req.query.lng);
    const radius = Math.min(50, parseFloat(req.query.radius) || 10);
    const limit  = Math.min(20, parseInt(req.query.limit) || 10);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: "lat and lng are required" });
    }

    const schools = await School.find(
      {
        "address.geo": {
          $near: {
            $geometry: { type: "Point", coordinates: [lng, lat] },
            $maxDistance: radius * 1000, // km → meters
          },
        },
        status: "active",
      },
      LIST_PROJECTION
    )
      .limit(limit)
      .lean();

    res.json({ success: true, count: schools.length, data: schools });
  } catch (err) {
    console.error("GET /nearby error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/schools/slug/:slug
// Full school detail by slug — uses slug unique index
router.get("/slug/:slug", async (req, res) => {
  try {
    const school = await School.findOne(
      { slug: req.params.slug.trim().toLowerCase(), status: "active" }
    ).lean();

    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }
    res.json({ success: true, data: school });
  } catch (err) {
    console.error("GET /slug error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/schools/by-id/:schoolId
// Full school detail by UDISE schoolId
router.get("/by-id/:schoolId", async (req, res) => {
  try {
    const schoolId = parseInt(req.params.schoolId);
    if (isNaN(schoolId)) {
      return res.status(400).json({ success: false, message: "Invalid schoolId" });
    }

    const school = await School.findOne({ schoolId, status: "active" }).lean();
    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }
    res.json({ success: true, data: school });
  } catch (err) {
    console.error("GET /by-id error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/schools
// Main list endpoint — paginated, filtered, sorted
// Returns LIST_PROJECTION only (not full document)
router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const filter = buildFilter(req.query);
    const sort   = SORT_MAP[req.query.sortBy] || SORT_MAP.newest;

    // Text search → add textScore sort on top
    const sortQuery = filter.$text
      ? { score: { $meta: "textScore" }, ...sort }
      : sort;

    const projection = filter.$text
      ? { ...LIST_PROJECTION, score: { $meta: "textScore" } }
      : LIST_PROJECTION;

    // Run query + count in parallel for performance
    const [schools, total] = await Promise.all([
      School.find(filter, projection)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean(),
      School.countDocuments(filter),
    ]);

    res.json({
      success:    true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      count:      schools.length,
      data:       schools,
    });
  } catch (err) {
    console.error("GET /schools error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/schools/:id
// Full school detail by MongoDB _id
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const school = await School.findOne(
      { _id: req.params.id, status: "active" }
    ).lean();

    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }
    res.json({ success: true, data: school });
  } catch (err) {
    console.error("GET /:id error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

