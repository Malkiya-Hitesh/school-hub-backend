// models/SchoolClaim.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const claimSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    name: String,
    phone: String,

    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected"],
      default: "draft",
    },

    email: String,

    otp: String,
    otpExpires: Date,

    emailVerified: {
      type: Boolean,
      default: false,
    },

    documents: [
      {
        url: String,
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SchoolClaim", claimSchema);