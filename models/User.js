// models/User.js
// School admin account — one user can manage one school (1:1)
// Future: multi-school support can be added via schools[] array

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    // ── Basic Info ───────────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // never returned in queries by default
      minlength: 6,
    },

    // ── Role ────────────────────────────────────────────────
    role: {
      type: String,
      enum: ["schoolAdmin", "superAdmin"],
      default: "schoolAdmin",
    },

    // ── Linked School ───────────────────────────────────────
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      default: null,
    },

    // ── Contact ─────────────────────────────────────────────
    phone: {
      type: String,
      trim: true,
      default: null,
    },

    // ── Account Status ──────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // ── Login Tracking ──────────────────────────────────────
    lastLoginAt: {
      type: Date,
      default: null,
    },

    // ── Refresh Token (JWT Auth) ────────────────────────────
    refreshToken: {
      type: String,
      default: null,
      select: false,
    },

    // ── Password Reset ──────────────────────────────────────
    resetPasswordToken: {
      type: String,
      default: null,
    },

    resetPasswordExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// ─── Hash Password Before Save ─────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// ─── Compare Password ──────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema, "users");