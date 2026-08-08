// models/SchoolClaim.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const documentSchema = new Schema(
  {
    url: { type: String, required: true, trim: true },
    type: { type: String, trim: true, default: "OTHER" },
  },
  { _id: false }
);

const claimSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    // Contact info submitted by the claimant for this school.
    name: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },

    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
      index: true,
    },

    // ── OTP (never stored in plaintext) ──────────────────────
    otpHash: { type: String, default: null, select: false },
    otpExpires: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    documents: {
      type: [documentSchema],
      default: [],
    },

    submittedAt: { type: Date, default: null },

    // ── Admin review ──────────────────────────────────────────
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, trim: true, default: null },
  },
  { timestamps: true }
);

// A user can have at most one non-terminal (draft/pending) claim at a time —
// enforced in the service layer (partial unique indexes on a boolean
// condition need a Mongo version check, so we do it defensively in code
// instead of relying purely on the index).
claimSchema.index({ userId: 1, status: 1 });
claimSchema.index({ schoolId: 1, status: 1 });

module.exports = mongoose.model("SchoolClaim", claimSchema);