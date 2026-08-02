// models/School.js
const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  DISTRICTS, MEDIUMS, BOARDS, STREAMS,
  MANAGEMENTS, SCHOOL_TYPES, LOCATION_TYPES,
  STATUS_TYPES, VISIBILITY_TYPES, SUBSCRIPTION_PLANS,
} = require("../helpers/filterOptions");
const { generateSlug } = require("../utils/slugify");
const { getNextSequence } = require("../utils/counter");
const {
  calculateStudentTeacherRatio,
  generateAboutDescription,
  generateSeoDefaults,
  calculateProfileCompletion,
} = require("../utils/schoolHelpers");

// FIX: this was referenced below in `achievements: { type: [achievementSchema] }`
// but the schema itself had been deleted — that's a `ReferenceError:
// achievementSchema is not defined` on require(), i.e. the app wouldn't boot.
// Restored it. Delete both this schema AND the `achievements` field below
// together if you meant to drop achievements from v2 entirely.
const achievementSchema = new Schema({
  title: { type: String, trim: true },
  description: { type: String, trim: true, default: null },
  imgUrl: { type: String, default: null },
  year: { type: Number, default: null },
}, { _id: true });

const facilityItemSchema = new Schema({
  label: { type: String, trim: true },
  description: { type: String, trim: true, default: null },
  imageUrl: { type: String, default: null },
}, { _id: true });

const resultSchema = new Schema({

  classLabel: {
    type: String,
    required: true,
  },

  year: {
    type: Number,
    required: true,
  },

  stream: {
    type: String,
    enum: STREAMS,
    default: null,
  },

  board: {
    type: String,
    enum: BOARDS,
  },

  medium: {
    type: String,
    enum: MEDIUMS,
  },

  appeared: {
    type: Number,
    default: 0,
  },

  passed: {
    type: Number,
    default: 0,
  },

  passingRate: {
    type: Number,
    default: 0,
  },

  posterImageUrl: {
    type: String,
    default: ""
  }



}, { _id: true });
// ─── Main Schema ─────────────────────────────────────────────

const schoolSchema = new Schema(
  {
    schoolId: { type: Number, unique: true, sparse: true, index: true },
    udiseCode: { type: String, trim: true, default: null, unique: true, sparse: true },
    slug: { type: String, unique: true, trim: true, lowercase: true, index: true },

    status: {
      type: { type: String, enum: STATUS_TYPES, default: "UNVERIFIED" },
      updatedAt: { type: Date, default: Date.now },
    },

    verification: {
      isVerified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null },
      verifiedBy: { type: Schema.Types.ObjectId, ref: "User", default: null }, // adjust ref name if your auth model differs
    },

    claim: {
      isClaimed: { type: Boolean, default: false },
      claimedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      claimedAt: { type: Date, default: null },
    },

    // ── Basics ───────────────────────────────────────────────
    basics: {
      schoolName: { type: String, trim: true, required: true },
      establishedYear: { type: Number, default: null },
      trustName: { type: String, default: null },
      principalName: { type: String, default: null },
      logo: { type: String, default: null },
      coverImage: { type: String, default: null },
    },

    // ── About ────────────────────────────────────────────────
    about: {
      tagline: { type: String, default: null },
      description: { type: String, default: null },
      vision: { type: String, default: null },
      mission: { type: String, default: null },
      principalMessage: { type: String, default: null },
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

        coordinates: { type: [Number], default: undefined }, // [lng, lat]
        googleMapsUrl: { type: String, default: null },
      },
    },

    // ── Contact ──────────────────────────────────────────────
    contact: {
      phone: { type: [String], default: [] },
      whatsapp: { type: String, default: null },
      email: { type: String, trim: true, lowercase: true, default: null },
      website: { type: String, trim: true, default: null },
    },

    academics: {
      board: [{ type: String, enum: BOARDS }],
      medium: [{ type: String, enum: MEDIUMS }],
      streams: [{ type: String, enum: STREAMS }],
      gradeFrom: { type: Number, min: 0, max: 12, default: null },
      gradeTo: { type: Number, min: 1, max: 12, default: null },
      shifts: { type: [String], default: [] },
      timing: {
        morning: { type: String, default: null },
        evening: { type: String, default: null },
      },
      totalStudents: { type: Number, default: 0 },
      totalTeachers: { type: Number, default: 0 },
      studentTeacherRatio: { type: Number, default: null },
      affiliationNumber: {
        type: String,
        default: null,
      },

      indexNumber: {
        type: String,
        default: null,
      },

      subjects: [{
        type: String,
        trim: true,
      }]
    },

    // ── Category ─────────────────────────────────────────────
    // category.type removed here — see buildFilters.js / validator.js /
    // constants.js, which are updated to match (categoryType filter dropped).
    category: {
      management: { type: String, enum: MANAGEMENTS, default: null },
      schoolType: { type: String, enum: SCHOOL_TYPES, default: null },
      locationType: { type: String, enum: LOCATION_TYPES, default: null },
    },

    // ── Admission (new in v2) ────────────────────────────────
    admission: {
      isOpen: {
        type: Boolean,
        default: false,
      },

      startDate: Date,
      endDate: Date,

      onlineAvailable: Boolean,

      admissionUrl: String,

      // NEW

      adminContact: {
        name: String,
        phone: String,
        email: String,
      },

      documentsRequired: [{
        type: String,
      }],

      eligibility: {
        type: String,
        default: null,
      },

      process: {
        type: String,
        default: null,
      },

      feeStructurePdfUrl: {
        type: String,
        default: null,
      }
    },

    social: {
      facebook: { type: String, default: null },
      instagram: { type: String, default: null },
      youtube: { type: String, default: null },
      linkedin: { type: String, default: null },
      twitter: { type: String, default: null },
      telegram: { type: String, default: null },
      whatsappChannel: { type: String, default: null },
    },


    seo: {
      title: { type: String, default: null },       // auto-filled if empty, see hook below
      description: { type: String, default: null },  // auto-filled if empty
      keywords: { type: [String], default: [] },     // auto-filled if empty
      canonical: { type: String, default: null },
      ogImage: { type: String, default: null },
      robots: { type: String, default: "index,follow" },
    },

    // ── Profile / Subscription ───────────────────────────────
    profile: {
      completion: { type: Number, min: 0, max: 100, default: 0 }, // auto-calculated
      visibility: { type: String, enum: VISIBILITY_TYPES, default: "PUBLIC" },
    },

    subscription: {
      plan: { type: String, enum: SUBSCRIPTION_PLANS, default: "FREE" },
      expiresAt: { type: Date, default: null },
    },

    // ── Retained from v1 ──────────────────────────────────────
    facilities: { type: [facilityItemSchema], default: [] },
    results: { type: [resultSchema], default: [] },
    achievements: { type: [achievementSchema], default: [] },
    fees: {
      minTuitionFees: { type: Number, default: null },
      maxTuitionFees: { type: Number, default: null },
      transportFees: { type: Number, default: null },
      hostelFees: { type: Number, default: null },
      otherFees: { type: Number, default: null },
    },
  },
  { timestamps: true, collection: "schools_v2" }
);

// ─── Auto-generation hooks ───────────────────────────────────
// Runs on every create/update that goes through .save() (NOT on
// findOneAndUpdate/updateOne — those skip Mongoose middleware by default).

schoolSchema.pre("validate", async function (next) {
  try {
    // Auto-assign schoolId once, on first creation
    if (this.isNew && !this.schoolId) {
      this.schoolId = await getNextSequence("schoolId");
    }

    // Auto-generate slug once, on first creation. Left alone after that so
    // published links/SEO never silently break when the name is edited later.
    if (this.isNew && !this.slug) {
      this.slug = generateSlug({
        schoolName: this.basics?.schoolName,
        district: this.address?.district,
        schoolId: this.schoolId,
      });
    }

    // Auto-calc student-teacher ratio
    if (this.academics) {
      this.academics.studentTeacherRatio = calculateStudentTeacherRatio(
        this.academics.totalStudents,
        this.academics.totalTeachers
      );
    }

    // Auto-fill about.description if the school didn't provide one
    if (this.about && !this.about.description) {
      this.about.description = generateAboutDescription(this);
    }

    // Auto-fill SEO defaults if missing
    if (this.seo) {
      const defaults = generateSeoDefaults(this);
      if (!this.seo.title) this.seo.title = defaults.title;
      if (!this.seo.description) this.seo.description = defaults.description;
      if (!this.seo.keywords || this.seo.keywords.length === 0) this.seo.keywords = defaults.keywords;
    }

    // Auto-calc profile completion %
    if (this.profile) {
      this.profile.completion = calculateProfileCompletion(this);
    }

    // Keep status.updatedAt in sync with status.type changes
    if (this.isModified("status.type")) {
      this.status.updatedAt = new Date();
    }

    next();
  } catch (err) {
    next(err);
  }
});

// ─── Indexes ─────────────────────────────────────────────────

schoolSchema.index({ "address.geo": "2dsphere" });

schoolSchema.index(
  {
    "basics.schoolName": "text",
    "address.village": "text",
    "address.taluka": "text",
    "address.district": "text",
    "seo.keywords": "text",
  },
  {
    name: "fulltext_search",
    weights: {
      "basics.schoolName": 10,
      "address.village": 5,
      "address.taluka": 3,
      "address.district": 2,
      "seo.keywords": 4,
    },
  }
);

schoolSchema.index({ "address.district": 1, "address.taluka": 1 }, { name: "district_taluka" });
schoolSchema.index({ "status.type": 1 }, { name: "status_type_1" });
schoolSchema.index({ "category.management": 1 }, { name: "management_1" });
schoolSchema.index({ "category.locationType": 1 }, { name: "location_type_1" });
schoolSchema.index({ "category.schoolType": 1 }, { name: "school_type_1" });
schoolSchema.index({ "academics.medium": 1 }, { name: "academics_medium_1" });
schoolSchema.index({ "academics.board": 1 }, { name: "academics_board_1" });
schoolSchema.index({ "admission.isOpen": 1 }, { name: "admission_isOpen_1" });
schoolSchema.index({ "claim.isClaimed": 1 }, { name: "claim_isClaimed_1" });
schoolSchema.index({ "verification.isVerified": 1 }, { name: "verification_isVerified_1" });
schoolSchema.index({ createdAt: -1 }, { name: "newest" });

module.exports = mongoose.model("School", schoolSchema, "schools_v2");