// routes/dashboard.js
// All routes require JWT login (protect middleware)
//
// ── School ────────────────────────────────────────────────────
// POST   /api/dashboard/school/register
// GET    /api/dashboard/school
// GET    /api/dashboard/stats
//
// ── Section updates ──────────────────────────────────────────
// PATCH  /api/dashboard/school/basics
// PATCH  /api/dashboard/school/address
// PATCH  /api/dashboard/school/academics
// PATCH  /api/dashboard/school/category
// PATCH  /api/dashboard/school/fees
// PATCH  /api/dashboard/school/contact
//
// ── Results ──────────────────────────────────────────────────
// GET    /api/dashboard/school/results
// POST   /api/dashboard/school/results
// PATCH  /api/dashboard/school/results/:resultId
// DELETE /api/dashboard/school/results/:resultId
//
// ── Achievements ─────────────────────────────────────────────
// GET    /api/dashboard/school/achievements
// POST   /api/dashboard/school/achievements
// PATCH  /api/dashboard/school/achievements/:achId
// DELETE /api/dashboard/school/achievements/:achId
//
// ── Facilities (showcase, school-uploaded) ───────────────────
// GET    /api/dashboard/school/facilities
// POST   /api/dashboard/school/facilities
// PATCH  /api/dashboard/school/facilities/:facId
// DELETE /api/dashboard/school/facilities/:facId
//
// ── Social Links ─────────────────────────────────────────────
// GET    /api/dashboard/school/social
// PUT    /api/dashboard/school/social   (replace all at once)
//
// ── UDISE Facility (read-only) ────────────────────────────────
// GET    /api/dashboard/school/udise-facility

const express  = require("express");
const router   = express.Router();
const mongoose = require("mongoose");
const School   = require("../models/School");
const User     = require("../models/User");
const { protect } = require("../middleware/auth");
const {
  DISTRICTS, MEDIUMS, BOARDS, MANAGEMENTS,
  SCHOOL_TYPES, LOCATION_TYPES, STREAMS,
} = require("../config/filterOptions");

router.use(protect);

// ─── Helpers ─────────────────────────────────────────────────

const generateSlug = (schoolName, district = "") => {
  const base = `${schoolName} ${district}`
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return `${base}-${Date.now()}`;
};

// Fetch the school owned by the logged-in user
const getOwnedSchool = async (req) => {
  if (!req.user.schoolId) return null;
  return School.findById(req.user.schoolId);
};

// Resolve school or send 404 — returns null if it responded already
const requireSchool = async (req, res) => {
  const school = await getOwnedSchool(req);
  if (!school) {
    res.status(404).json({ success: false, message: "No school found for this account." });
    return null;
  }
  return school;
};

// ═══════════════════════════════════════════════════════════════
// SCHOOL — register / fetch / stats
// ═══════════════════════════════════════════════════════════════

// POST /api/dashboard/school/register
router.post("/school/register", async (req, res) => {
  try {
    if (req.user.schoolId) {
      return res.status(409).json({ success: false, message: "You have already registered a school." });
    }

    const {
      schoolName, phone, email, website, description, trustName, establishedYear,
      district, village, taluka, pincode, fullAddress,
      management, schoolType, locationType,
      gradeFrom, gradeTo, medium, board,
      contactName, contactPhone, contactEmail, designation,
    } = req.body;

    if (!schoolName?.trim()) return res.status(400).json({ success: false, message: "School name is required." });
    if (!district || !DISTRICTS.includes(district)) return res.status(400).json({ success: false, message: "Valid district is required." });
    if (management   && !MANAGEMENTS.includes(management))     return res.status(400).json({ success: false, message: "Invalid management type."  });
    if (schoolType   && !SCHOOL_TYPES.includes(schoolType))    return res.status(400).json({ success: false, message: "Invalid school type."      });
    if (locationType && !LOCATION_TYPES.includes(locationType))return res.status(400).json({ success: false, message: "Invalid location type."   });

    const slug = generateSlug(schoolName, district);

    const school = await School.create({
      slug,
      adminInfo: {
        name:        contactName?.trim()  || req.user.name,
        phone:       contactPhone?.trim() || req.user.phone || null,
        email:       contactEmail?.trim() || req.user.email,
        verified:    false,
        designation: designation || null,
        registeredAt: new Date(),
      },
      basics: {
        schoolName:      schoolName.trim(),
        phone:           phone?.trim()       || null,
        email:           email?.trim()       || null,
        website:         website?.trim()     || null,
        description:     description?.trim() || null,
        trustName:       trustName?.trim()   || null,
        establishedYear: establishedYear     || null,
      },
      address: {
        district, state: "GUJARAT",
        village:  village?.trim()     || null,
        taluka:   taluka?.trim()      || null,
        pincode:  pincode?.trim()     || null,
        full:     fullAddress?.trim() || null,
      },
      category: {
        management:   management   || null,
        schoolType:   schoolType   || null,
        locationType: locationType || null,
      },
      academics: {
        gradeFrom: gradeFrom !== undefined ? Number(gradeFrom) : null,
        gradeTo:   gradeTo   !== undefined ? Number(gradeTo)   : null,
        medium:    Array.isArray(medium) ? medium.filter(m => MEDIUMS.includes(m)) : [],
        board:     Array.isArray(board)  ? board.filter(b => BOARDS.includes(b))   : [],
      },
      status: "unverified", isClaimed: true, isVerified: false,
    });

    await User.findByIdAndUpdate(req.user._id, { $set: { schoolId: school._id } });

    res.status(201).json({
      success: true,
      message: "School registered. It will be reviewed and activated shortly.",
      data: school,
    });
  } catch (err) {
    console.error("POST /dashboard/school/register:", err.message);
    if (err.code === 11000) return res.status(409).json({ success: false, message: "A school with this name already exists. Try a slightly different name." });
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/school
router.get("/school", async (req, res) => {
  try {
    if (!req.user.schoolId) return res.status(404).json({ success: false, message: "No school registered yet.", hasSchool: false });
    const school = await School.findById(req.user.schoolId).lean();
    if (!school) return res.status(404).json({ success: false, message: "School not found.", hasSchool: false });
    res.json({ success: true, hasSchool: true, data: school });
  } catch (err) {
    console.error("GET /dashboard/school:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/stats
router.get("/stats", async (req, res) => {
  try {
    if (!req.user.schoolId) return res.json({ success: true, hasSchool: false, stats: null });
    const school = await School.findById(req.user.schoolId)
      .select("basics.schoolName status isVerified isClaimed academics.totalStudents academics.totalTeachers createdAt adminInfo")
      .lean();
    if (!school) return res.json({ success: true, hasSchool: false, stats: null });
    res.json({
      success: true, hasSchool: true,
      stats: {
        schoolName:    school.basics?.schoolName,
        status:        school.status,
        isVerified:    school.isVerified,
        isClaimed:     school.isClaimed,
        totalStudents: school.academics?.totalStudents || 0,
        totalTeachers: school.academics?.totalTeachers || 0,
        registeredAt:  school.adminInfo?.registeredAt || school.createdAt,
        schoolId:      school._id,
      },
    });
  } catch (err) {
    console.error("GET /dashboard/stats:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// SECTION PATCHES
// ═══════════════════════════════════════════════════════════════

// PATCH /api/dashboard/school/basics
router.patch("/school/basics", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const allowed = ["schoolName","phone","email","website","description","trustName","establishedYear","logoImg","coverImg"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[`basics.${key}`] = req.body[key];
    }
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "Nothing to update." });
    const updated = await School.findByIdAndUpdate(school._id, { $set: updates }, { new: true, runValidators: true }).lean();
    res.json({ success: true, message: "Basic info updated.", data: updated });
  } catch (err) {
    console.error("PATCH /school/basics:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/dashboard/school/address
router.patch("/school/address", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { district, village, taluka, pincode, full, googleMapsUrl } = req.body;
    if (district && !DISTRICTS.includes(district)) return res.status(400).json({ success: false, message: "Invalid district." });
    const updates = {};
    if (district      !== undefined) updates["address.district"]     = district;
    if (village       !== undefined) updates["address.village"]      = village?.trim()      || null;
    if (taluka        !== undefined) updates["address.taluka"]       = taluka?.trim()       || null;
    if (pincode       !== undefined) updates["address.pincode"]      = pincode?.trim()      || null;
    if (full          !== undefined) updates["address.full"]         = full?.trim()         || null;
    if (googleMapsUrl !== undefined) updates["address.googleMapsUrl"]= googleMapsUrl?.trim()|| null;
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "Nothing to update." });
    const updated = await School.findByIdAndUpdate(school._id, { $set: updates }, { new: true, runValidators: true }).lean();
    res.json({ success: true, message: "Address updated.", data: updated });
  } catch (err) {
    console.error("PATCH /school/address:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/dashboard/school/academics
router.patch("/school/academics", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { gradeFrom, gradeTo, medium, board, streams, totalStudents, totalTeachers } = req.body;
    const updates = {};
    if (gradeFrom     !== undefined) updates["academics.gradeFrom"]     = Number(gradeFrom);
    if (gradeTo       !== undefined) updates["academics.gradeTo"]       = Number(gradeTo);
    if (totalStudents !== undefined) updates["academics.totalStudents"] = Number(totalStudents);
    if (totalTeachers !== undefined) updates["academics.totalTeachers"] = Number(totalTeachers);
    if (Array.isArray(medium))  updates["academics.medium"]  = medium.filter(m => MEDIUMS.includes(m));
    if (Array.isArray(board))   updates["academics.board"]   = board.filter(b => BOARDS.includes(b));
    if (Array.isArray(streams)) updates["academics.streams"] = streams.filter(s => STREAMS.includes(s));
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "Nothing to update." });
    const updated = await School.findByIdAndUpdate(school._id, { $set: updates }, { new: true, runValidators: true }).lean();
    res.json({ success: true, message: "Academics updated.", data: updated });
  } catch (err) {
    console.error("PATCH /school/academics:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/dashboard/school/category
router.patch("/school/category", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { management, schoolType, locationType } = req.body;
    if (management   && !MANAGEMENTS.includes(management))     return res.status(400).json({ success: false, message: "Invalid management."  });
    if (schoolType   && !SCHOOL_TYPES.includes(schoolType))    return res.status(400).json({ success: false, message: "Invalid school type."  });
    if (locationType && !LOCATION_TYPES.includes(locationType))return res.status(400).json({ success: false, message: "Invalid location type."});
    const updates = {};
    if (management   !== undefined) updates["category.management"]   = management;
    if (schoolType   !== undefined) updates["category.schoolType"]   = schoolType;
    if (locationType !== undefined) updates["category.locationType"] = locationType;
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "Nothing to update." });
    const updated = await School.findByIdAndUpdate(school._id, { $set: updates }, { new: true, runValidators: true }).lean();
    res.json({ success: true, message: "Category updated.", data: updated });
  } catch (err) {
    console.error("PATCH /school/category:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/dashboard/school/fees
router.patch("/school/fees", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { minTuitionFees, maxTuitionFees, transportFees, hostelFees, otherFees } = req.body;
    const toNum = v => (v === "" || v === undefined || v === null) ? null : Number(v);
    const updates = {};
    if (minTuitionFees !== undefined) updates["fees.minTuitionFees"] = toNum(minTuitionFees);
    if (maxTuitionFees !== undefined) updates["fees.maxTuitionFees"] = toNum(maxTuitionFees);
    if (transportFees  !== undefined) updates["fees.transportFees"]  = toNum(transportFees);
    if (hostelFees     !== undefined) updates["fees.hostelFees"]     = toNum(hostelFees);
    if (otherFees      !== undefined) updates["fees.otherFees"]      = toNum(otherFees);
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "Nothing to update." });
    const updated = await School.findByIdAndUpdate(school._id, { $set: updates }, { new: true, runValidators: true }).lean();
    res.json({ success: true, message: "Fees updated.", data: updated });
  } catch (err) {
    console.error("PATCH /school/fees:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/dashboard/school/contact
router.patch("/school/contact", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { contactName, contactPhone, contactEmail, designation } = req.body;
    const validDesignations = ["Principal","Vice Principal","Admin","Teacher","Owner","Other"];
    if (designation && !validDesignations.includes(designation)) return res.status(400).json({ success: false, message: "Invalid designation." });
    const updates = {};
    if (contactName?.trim())  { updates["adminInfo.name"] = contactName.trim(); }
    if (contactPhone?.trim()) { updates["adminInfo.phone"] = contactPhone.trim(); }
    if (contactEmail?.trim()) { updates["adminInfo.email"] = contactEmail.trim(); }
    if (designation)            updates["adminInfo.designation"] = designation;
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "Nothing to update." });
    const updated = await School.findByIdAndUpdate(school._id, { $set: updates }, { new: true, runValidators: true }).lean();
    res.json({ success: true, message: "Contact info updated.", data: updated });
  } catch (err) {
    console.error("PATCH /school/contact:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// RESULTS  — board exam results (Std 10 / 12)
// ═══════════════════════════════════════════════════════════════

// GET /api/dashboard/school/results
router.get("/school/results", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    res.json({ success: true, data: school.results || [] });
  } catch (err) {
    console.error("GET /school/results:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/dashboard/school/results
router.post("/school/results", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;

    const { year, class: cls, totalStudents, passStudents, passRatio, posterImg } = req.body;
    if (!year || !cls) return res.status(400).json({ success: false, message: "year and class are required." });
    if (![10, 12].includes(Number(cls))) return res.status(400).json({ success: false, message: "class must be 10 or 12." });

    const total = Number(totalStudents) || 0;
    const pass  = Number(passStudents)  || 0;
    const ratio = passRatio !== undefined
      ? Number(passRatio)
      : (total > 0 ? Math.round((pass / total) * 100 * 10) / 10 : null);

    const updated = await School.findByIdAndUpdate(
      school._id,
      { $push: { results: { year: String(year), class: Number(cls), totalStudents: total, passStudents: pass, passRatio: ratio, posterImg: posterImg || null } } },
      { new: true, runValidators: true }
    ).lean();

    const added = updated.results[updated.results.length - 1];
    res.status(201).json({ success: true, message: "Result added.", data: added, school: updated });
  } catch (err) {
    console.error("POST /school/results:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/dashboard/school/results/:resultId
router.patch("/school/results/:resultId", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { resultId } = req.params;
    if (!mongoose.isValidObjectId(resultId)) return res.status(400).json({ success: false, message: "Invalid result ID." });
    const result = school.results.id(resultId);
    if (!result) return res.status(404).json({ success: false, message: "Result not found." });

    const { year, class: cls, totalStudents, passStudents, passRatio, posterImg } = req.body;
    const updates = {};
    if (year          !== undefined) updates["results.$.year"]          = String(year);
    if (cls           !== undefined) updates["results.$.class"]         = Number(cls);
    if (totalStudents !== undefined) updates["results.$.totalStudents"] = Number(totalStudents);
    if (passStudents  !== undefined) updates["results.$.passStudents"]  = Number(passStudents);
    if (posterImg     !== undefined) updates["results.$.posterImg"]     = posterImg || null;

    const total = totalStudents !== undefined ? Number(totalStudents) : result.totalStudents;
    const pass  = passStudents  !== undefined ? Number(passStudents)  : result.passStudents;
    updates["results.$.passRatio"] = passRatio !== undefined
      ? Number(passRatio)
      : (total > 0 ? Math.round((pass / total) * 100 * 10) / 10 : null);

    const updated = await School.findOneAndUpdate(
      { _id: school._id, "results._id": resultId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();
    res.json({ success: true, message: "Result updated.", data: updated });
  } catch (err) {
    console.error("PATCH /school/results/:id:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/dashboard/school/results/:resultId
router.delete("/school/results/:resultId", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { resultId } = req.params;
    if (!mongoose.isValidObjectId(resultId)) return res.status(400).json({ success: false, message: "Invalid result ID." });
    const updated = await School.findByIdAndUpdate(school._id, { $pull: { results: { _id: resultId } } }, { new: true }).lean();
    res.json({ success: true, message: "Result deleted.", data: updated });
  } catch (err) {
    console.error("DELETE /school/results/:id:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// ACHIEVEMENTS
// ═══════════════════════════════════════════════════════════════

// GET /api/dashboard/school/achievements
router.get("/school/achievements", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    res.json({ success: true, data: school.achievements || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/dashboard/school/achievements
router.post("/school/achievements", async (req, res) => {
  try {
    console.log(req.body);
    
    const school = await requireSchool(req, res);
    console.log(school);
    
    if (!school) return;
    const { title, description, imgUrl, year } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Title is required." });

    const updated = await School.findByIdAndUpdate(
      school._id,
      { $push: { achievements: { title: title.trim(), description: description?.trim() || null, imgUrl: imgUrl || null, year: year ? Number(year) : null } } },
      { new: true, runValidators: true }
    ).lean();

    const added = updated.achievements[updated.achievements.length - 1];
    res.status(201).json({ success: true, message: "Achievement added.", data: added, school: updated });
  } catch (err) {
    console.error("POST /school/achievements:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/dashboard/school/achievements/:achId
router.patch("/school/achievements/:achId", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { achId } = req.params;
    if (!mongoose.isValidObjectId(achId)) return res.status(400).json({ success: false, message: "Invalid achievement ID." });
    if (!school.achievements.id(achId)) return res.status(404).json({ success: false, message: "Achievement not found." });

    const { title, description, imgUrl, year } = req.body;
    const updates = {};
    if (title       !== undefined) updates["achievements.$.title"]       = title.trim();
    if (description !== undefined) updates["achievements.$.description"] = description?.trim() || null;
    if (imgUrl      !== undefined) updates["achievements.$.imgUrl"]      = imgUrl || null;
    if (year        !== undefined) updates["achievements.$.year"]        = year ? Number(year) : null;
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "Nothing to update." });

    const updated = await School.findOneAndUpdate(
      { _id: school._id, "achievements._id": achId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();
    res.json({ success: true, message: "Achievement updated.", data: updated });
  } catch (err) {
    console.error("PATCH /school/achievements/:id:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/dashboard/school/achievements/:achId
router.delete("/school/achievements/:achId", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { achId } = req.params;
    if (!mongoose.isValidObjectId(achId)) return res.status(400).json({ success: false, message: "Invalid achievement ID." });
    const updated = await School.findByIdAndUpdate(school._id, { $pull: { achievements: { _id: achId } } }, { new: true }).lean();
    res.json({ success: true, message: "Achievement deleted.", data: updated });
  } catch (err) {
    console.error("DELETE /school/achievements/:id:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// FACILITIES  (school-uploaded showcase items — NOT UDISE)
// ═══════════════════════════════════════════════════════════════

// GET /api/dashboard/school/facilities
router.get("/school/facilities", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    res.json({ success: true, data: school.facilities || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/dashboard/school/facilities
router.post("/school/facilities", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { title, description, imgUrl } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: "Title is required." });

    const updated = await School.findByIdAndUpdate(
      school._id,
      { $push: { facilities: { title: title.trim(), description: description?.trim() || null, imgUrl: imgUrl || null } } },
      { new: true, runValidators: true }
    ).lean();

    const added = updated.facilities[updated.facilities.length - 1];
    res.status(201).json({ success: true, message: "Facility added.", data: added, school: updated });
  } catch (err) {
    console.error("POST /school/facilities:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/dashboard/school/facilities/:facId
router.patch("/school/facilities/:facId", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { facId } = req.params;
    if (!mongoose.isValidObjectId(facId)) return res.status(400).json({ success: false, message: "Invalid facility ID." });
    if (!school.facilities.id(facId)) return res.status(404).json({ success: false, message: "Facility not found." });

    const { title, description, imgUrl } = req.body;
    const updates = {};
    if (title       !== undefined) updates["facilities.$.title"]       = title.trim();
    if (description !== undefined) updates["facilities.$.description"] = description?.trim() || null;
    if (imgUrl      !== undefined) updates["facilities.$.imgUrl"]      = imgUrl || null;
    if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "Nothing to update." });

    const updated = await School.findOneAndUpdate(
      { _id: school._id, "facilities._id": facId },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();
    res.json({ success: true, message: "Facility updated.", data: updated });
  } catch (err) {
    console.error("PATCH /school/facilities/:id:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/dashboard/school/facilities/:facId
router.delete("/school/facilities/:facId", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { facId } = req.params;
    if (!mongoose.isValidObjectId(facId)) return res.status(400).json({ success: false, message: "Invalid facility ID." });
    const updated = await School.findByIdAndUpdate(school._id, { $pull: { facilities: { _id: facId } } }, { new: true }).lean();
    res.json({ success: true, message: "Facility deleted.", data: updated });
  } catch (err) {
    console.error("DELETE /school/facilities/:id:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// SOCIAL LINKS  — replace-all strategy
// ═══════════════════════════════════════════════════════════════

const PLATFORMS = ["Facebook","Instagram","YouTube","Twitter","LinkedIn","WhatsApp","Telegram","Pinterest","Snapchat","Website"];

// GET /api/dashboard/school/social
router.get("/school/social", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    res.json({ success: true, data: school.socialLinks || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/dashboard/school/social
// Body: { links: [ { platform, url }, … ] }
router.put("/school/social", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const { links } = req.body;
    if (!Array.isArray(links)) return res.status(400).json({ success: false, message: "links must be an array." });

    const cleaned = [];
    for (const item of links) {
      if (!item.platform || !PLATFORMS.includes(item.platform)) {
        return res.status(400).json({ success: false, message: `Invalid platform: ${item.platform}` });
      }
      if (!item.url?.trim()) continue; // skip empty URLs silently
      cleaned.push({ platform: item.platform, url: item.url.trim() });
    }

    const updated = await School.findByIdAndUpdate(
      school._id,
      { $set: { socialLinks: cleaned } },
      { new: true, runValidators: true }
    ).lean();
    res.json({ success: true, message: "Social links updated.", data: updated.socialLinks });
  } catch (err) {
    console.error("PUT /school/social:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════
// UDISE FACILITY  — read-only
// ═══════════════════════════════════════════════════════════════

// PATCH /api/dashboard/school/udise-facility
// Updates the raw UDISE / infrastructure facility block
router.patch("/school/udise-facility", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;

    const {
      totalClassrooms, goodClassrooms, toiletBoys, toiletGirls,
      drinkingWater, electricity, library, playground,
      internet, solarPanel, ramps, medicalCheckup, integratedLab,
      boundaryWall, computers,
    } = req.body;

    const toNum  = v => (v === "" || v === undefined || v === null) ? null : Number(v);
    const toBool = v => (v === undefined || v === null) ? null : Boolean(v);

    const updates = {};
    if (totalClassrooms !== undefined) updates["facility.totalClassrooms"] = toNum(totalClassrooms);
    if (goodClassrooms  !== undefined) updates["facility.goodClassrooms"]  = toNum(goodClassrooms);
    if (toiletBoys      !== undefined) updates["facility.toiletBoys"]      = toNum(toiletBoys);
    if (toiletGirls     !== undefined) updates["facility.toiletGirls"]     = toNum(toiletGirls);
    if (drinkingWater   !== undefined) updates["facility.drinkingWater"]   = toBool(drinkingWater);
    if (electricity     !== undefined) updates["facility.electricity"]     = toBool(electricity);
    if (library         !== undefined) updates["facility.library"]         = toBool(library);
    if (playground      !== undefined) updates["facility.playground"]      = toBool(playground);
    if (internet        !== undefined) updates["facility.internet"]        = toBool(internet);
    if (solarPanel      !== undefined) updates["facility.solarPanel"]      = toBool(solarPanel);
    if (ramps           !== undefined) updates["facility.ramps"]           = toBool(ramps);
    if (medicalCheckup  !== undefined) updates["facility.medicalCheckup"]  = toBool(medicalCheckup);
    if (integratedLab   !== undefined) updates["facility.integratedLab"]   = toBool(integratedLab);
    if (boundaryWall    !== undefined) updates["facility.boundaryWall"]    = boundaryWall || null;

    if (computers && typeof computers === "object") {
      if (computers.desktops  !== undefined) updates["facility.computers.desktops"]  = toNum(computers.desktops);
      if (computers.laptops   !== undefined) updates["facility.computers.laptops"]   = toNum(computers.laptops);
      if (computers.tablets   !== undefined) updates["facility.computers.tablets"]   = toNum(computers.tablets);
      if (computers.projector !== undefined) updates["facility.computers.projector"] = toNum(computers.projector);
      if (computers.printer   !== undefined) updates["facility.computers.printer"]   = toNum(computers.printer);
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ success: false, message: "Nothing to update." });
    }

    const updated = await School.findByIdAndUpdate(school._id, { $set: updates }, { new: true, runValidators: true }).lean();
    res.json({ success: true, message: "Infrastructure data updated.", data: updated });
  } catch (err) {
    console.error("PATCH /school/udise-facility:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/dashboard/school/udise-facility
router.get("/school/udise-facility", async (req, res) => {
  try {
    const school = await requireSchool(req, res);
    if (!school) return;
    const s = await School.findById(school._id).select("facility").lean();
    res.json({ success: true, data: s?.facility || null });
  } catch (err) {
    console.error("GET /school/udise-facility:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;