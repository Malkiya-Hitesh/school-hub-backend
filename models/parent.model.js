// src/models/parent.model.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { RELATION, MOBILE_REGEX } = require("../constants/academic.constants");
const { Schema } = mongoose;


const parentSchema = new Schema(
  {
  
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
      select: false, // never returned by default in queries
    },
    refreshToken: {
      type: String,
      select: false,
    },

    fullName: {
      type: String,
      required: [true, "Parent full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    relation: {
      type: String,
      required: [true, "Relation with student is required"],
      enum: {
        values: RELATION,
        message: "Relation must be one of FATHER, MOTHER, or GUARDIAN",
      },
    },

    mobileNumber: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      validate: {
        validator: (v) => MOBILE_REGEX.test(v),
        message: (props) =>
          `${props.value} is not a valid Indian mobile number`,
      },
      index: true,
    },

    occupation: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null,
    },

    // One parent -> many students. This array is kept in sync by the
    // controller layer whenever a student is created/linked/removed
    // (see student.controller.js). Student.parent is the source of truth;
    // this is a denormalized convenience list for fast "children of parent" reads.
   
role:{
  type: String,
  default: "parents"

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
      fullAddress: {
        type: String,
        trim: true,
        default: null,
      },
    },
  },
  { timestamps: true }
);



parentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

parentSchema.methods.isPasswordCorrect = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

parentSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, email: this.email, role: "parent" },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d" }
  );
};
parentSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};
parentSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id, role: "parent" },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d" }
  );
};

module.exports = mongoose.model("Parent", parentSchema);
