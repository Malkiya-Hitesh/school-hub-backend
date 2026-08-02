// src/models/student.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Schema } = mongoose;
const {
  GENDER,
  MEDIUM,
  STANDARDS,
  ACADEMIC_YEAR_REGEX,
} = require("../constants/academic.constants");

const studentSchema = new Schema(
  {
    // --- Login credentials ---
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },

    fullName: {
      type: String,
      required: [true, "Student full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: GENDER,
        message: "Gender must be Male, Female, or Other",
      },
    },

    dateOfBirth: {
      type: Date,
      required: [true, "Date of birth is required"],
      validate: {
        validator: (v) => v instanceof Date && v.getTime() < Date.now(),
        message: "Date of birth must be a valid date in the past",
      },
    },

    currentStandard: {
      type: String,
      required: [true, "Current standard/class is required"],
      enum: {
        values: STANDARDS,
        message: "Please select a valid standard/class",
      },
    },

    // Free-text name for now. If you already have a `School` collection,
    // swap this for a ref (see `school` field below, left optional) so
    // this stays useful even for students whose school isn't onboarded yet.
    schoolName: {
      type: String,
      trim: true,
      default: null,
    },


    school: {
      type: Schema.Types.ObjectId,
      ref: "School",
      default: null,
    },

    medium: {
      type: String,
      required: [true, "Medium of instruction is required"],
      enum: {
        values: MEDIUM,
        message: "Medium must be Gujarati, English, or Hindi",
      },
    },

    academicYear: {
      type: String,
      required: [true, "Academic year is required"],
      trim: true,
      validate: {
        validator: (v) => ACADEMIC_YEAR_REGEX.test(v),
        message: "Academic year must be in format YYYY-YY or YYYY-YYYY (e.g. 2025-26)",
      },
    },
role:{
  type: String,
  default: "students"

},

    address: {
      district: {
        type: String,
        required: [true, "District is required"],
        trim: true,
      },
      taluka: {
        type: String,
        required: [true, "Taluka is required"],
        trim: true,
      },
      villageOrCity: {
        type: String,
        required: [true, "Village/City is required"],
        trim: true,
      },
    },

    
  },
  { timestamps: true }
);

// Fast filtering by location + academic year (dashboard/reporting use case)
studentSchema.index({ "address.district": 1, "address.taluka": 1 });
studentSchema.index({ academicYear: 1, currentStandard: 1 });


// --- Auth hooks & methods ---

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

studentSchema.methods.isPasswordCorrect = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

studentSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: "student" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
};
studentSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

studentSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id, role: "student" },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" }
  );
};

module.exports = mongoose.model("Student", studentSchema);
