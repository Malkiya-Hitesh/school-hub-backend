// models/School.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  DISTRICTS, MEDIUMS, BOARDS, STREAMS,
  MANAGEMENTS, SCHOOL_TYPES, LOCATION_TYPES, CATEGORY_TYPES,
} = require("../config/filterOptions");

// ─── Sub-schemas ─────────────────────────────────────────────

const achievementSchema = new Schema({
  title: { type: String, trim: true },
  description: { type: String, trim: true, default: null },
  imgUrl: { type: String, default: null },
  year: { type: Number, default: null },
}, { _id: true });

const facilityItemSchema = new Schema({
  title: { type: String, trim: true },
  description: { type: String, trim: true, default: null },
  imgUrl: { type: String, default: null },
}, { _id: true });

const resultSchema = new Schema({
  year: { type: String, required: true },  // e.g. "2024-25"
  class: { type: Number, required: true },  // 10 or 12
  totalStudents: { type: Number, default: 0 },
  passStudents: { type: Number, default: 0 },
  passRatio: { type: Number, default: null },   // percentage
  posterImg: { type: String, default: null },
}, { _id: true });

const socialLinkSchema = new Schema({
  platform: {
    type: String,
    enum: ["Facebook", "Instagram", "YouTube", "Twitter", "LinkedIn",
      "WhatsApp", "Telegram", "Pinterest", "Snapchat", "Website"],
  },
  url: { type: String, trim: true },
}, { _id: false });

// ─── Main Schema ─────────────────────────────────────────────

const schoolSchema = new Schema(
  {
    // ── Identifiers ──────────────────────────────────────────
    schoolId: { type: Number, unique: true, sparse: true },
    udiseCode: { type: String, trim: true, default: null },
    slug: { type: String, unique: true, trim: true, lowercase: true, index: true },

  
    _udiseRaw: {
      yearId: { type: Number, default: null },
      yearDesc: { type: String, default: null },
    },

    adminInfo: {
      name: { type: String, default: null },
      email: { type: String, trim: true, default: null },
      phone: { type: String, trim: true, default: null },
      verified: { type: Boolean, default: false },


    },

    // ── Basics ───────────────────────────────────────────────
    basics: {
      schoolName: { type: String, trim: true },
      establishedYear: { type: Number, default: null },
      phone: { type: String, default: null },
      email: { type: String, trim: true, default: null },
      website: { type: String, trim: true, default: null },
      logoImg: { type: String, default: null },
      coverImg: { type: String, default: null },
      description: { type: String, default: null },
      trustName: { type: String, default: null },
    },

    // ── Address ──────────────────────────────────────────────
    address: {
      full: { type: String, default: null },
      village: { type: String, trim: true, default: null },
      taluka: { type: String, trim: true, default: null },
      district: { type: String, trim: true, enum: DISTRICTS },
      state: { type: String, default: "GUJARAT" },
      pincode: { type: String, trim: true, default: null },
      geo: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: undefined }, // [lng, lat]
      },
      googleMapsUrl: { type: String, default: null },
    },

    // ── Category ─────────────────────────────────────────────
    category: {
      type: { type: String, enum: CATEGORY_TYPES, default: null },
      management: { type: String, enum: MANAGEMENTS, default: null },
      managementId: { type: Number, default: null },
      locationType: { type: String, enum: LOCATION_TYPES, default: null },
      schoolType: { type: String, enum: SCHOOL_TYPES, default: null },
    },

    // ── Academics ────────────────────────────────────────────
    academics: {
      gradeFrom: { type: Number, min: 0, max: 12, default: null },
      gradeTo: { type: Number, min: 1, max: 12, default: null },
      medium: [{ type: String, enum: MEDIUMS }],
      board: [{ type: String, enum: BOARDS }],
      streams: [{ type: String, enum: STREAMS }],
      shifts: [String],
      totalStudents: { type: Number, default: 0 },
      totalBoys: { type: Number, default: 0 },
      totalGirls: { type: Number, default: 0 },
      totalTeachers: { type: Number, default: 0 },
      totalTeacherMale: { type: Number, default: 0 },
      totalTeacherFemale: { type: Number, default: 0 },
      studentTeacherRatio: { type: Number, default: null },
    },
fees: {
  minTuitionFees: { type: Number, default: null },
  maxTuitionFees: { type: Number, default: null },
  transportFees: { type: Number, default: null },
  hostelFees: { type: Number, default: null },
  otherFees: { type: Number, default: null }
},
    // ── Facility (UDISE raw — optional) ──────────────────────
    facility: {
      totalClassrooms: { type: Number, default: null },
      goodClassrooms: { type: Number, default: null },
      toiletBoys: { type: Number, default: null },
      toiletGirls: { type: Number, default: null },
      drinkingWater: { type: Boolean, default: null },
      electricity: { type: Boolean, default: null },
      library: { type: Boolean, default: null },
      playground: { type: Boolean, default: null },
      internet: { type: Boolean, default: null },
      solarPanel: { type: Boolean, default: null },
      ramps: { type: Boolean, default: null },
      medicalCheckup: { type: Boolean, default: null },
      integratedLab: { type: Boolean, default: null },
      boundaryWall: { type: String, default: null },
      computers: {
        desktops: { type: Number, default: null },
        laptops: { type: Number, default: null },
        tablets: { type: Number, default: null },
        projector: { type: Number, default: null },
        printer: { type: Number, default: null },
      },
    },

    // ── Facilities (school-uploaded showcase) ─────────────────
    facilities: { type: [facilityItemSchema], default: [] },

    // ── Fees ─────────────────────────────────────────────────
    fees: {
      minTuitionFees: { type: Number, default: null },
      maxTuitionFees: { type: Number, default: null },
      transportFees: { type: Number, default: null },
      hostelFees: { type: Number, default: null },
      otherFees: { type: Number, default: null },
    },

    // ── Results ──────────────────────────────────────────────
    results: { type: [resultSchema], default: [] },

    // ── Achievements ─────────────────────────────────────────
    achievements: { type: [achievementSchema], default: [] },

    // ── Social Links ─────────────────────────────────────────
    socialLinks: { type: [socialLinkSchema], default: [] },

    // ── Flags ────────────────────────────────────────────────
    isClaimed: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },

    // ── Status ───────────────────────────────────────────────
    status: {
      type: String,
      enum: ["active", "inactive", "closed", "unverified"],
      default: "active",
    },

    // ── Meta ─────────────────────────────────────────────────
    meta: {
      search: {
        keywords: { type: [String], default: [] },
        tags: { type: [String], default: [] },
        boostScore: { type: Number, default: 1 },
      },
      seo: {
        title: { type: String, default: null },
        description: { type: String, default: null },
        ogImage: { type: String, default: null },
      },
    },
  },
  { timestamps: true, collection: "schools" }
);

// ─── Indexes ─────────────────────────────────────────────────

schoolSchema.index({ "address.geo": "2dsphere" });

schoolSchema.index(
  {
    "basics.schoolName": "text",
    "address.village": "text",
    "address.taluka": "text",
    "address.district": "text",
    "meta.search.keywords": "text",
    "meta.search.tags": "text",
  },
  {
    name: "fulltext_search",
    weights: {
      "basics.schoolName": 10,
      "address.village": 5,
      "address.taluka": 3,
      "address.district": 2,
    },
  }
);

schoolSchema.index({ "address.district": 1, "address.taluka": 1 }, { name: "district_taluka" });
schoolSchema.index({ "academics.gradeFrom": 1, "academics.gradeTo": 1 }, { name: "grade_range" });
schoolSchema.index({ status: 1 }, { name: "is_active" });
schoolSchema.index({ "category.management": 1 }, { name: "management_1" });
schoolSchema.index({ "category.locationType": 1 }, { name: "location_type_1" });
schoolSchema.index({ "category.schoolType": 1 }, { name: "school_type_1" });
schoolSchema.index({ "academics.totalStudents": -1 }, { name: "students_total_desc" });
schoolSchema.index({ createdAt: -1 }, { name: "newest" });

module.exports = mongoose.model("School", schoolSchema, "schools");