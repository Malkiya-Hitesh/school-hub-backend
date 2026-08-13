// src/controllers/parent.controller.js
const Parent = require("../models/parent.model");

const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { validateParentPayload } = require("../validators/parent.validator");
const { generateToken } = require("../middleware/auth");
const { findParentByEmail } = require("../services/parentAuth.service");
const AppError = require("../utils/appError");


// POST /api/parents
//   create  parent  
const createParent = async (req, res) => {
  const errors = validateParentPayload(req.body);
  if (errors.length) throw new ApiError(400, "Validation failed", errors);

  const { fullName, relation, mobileNumber, email, occupation, address, password } = req.body;

  const parent = await Parent.create({
    role: "parents",
    fullName,
    relation,
    mobileNumber,
    email: email || null,
    occupation: occupation || null,
    address,
    password,
  });


  const token = generateToken(parent._id);

  res.cookie("schoolHubToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });


  return res
    .status(201)
    .json(new ApiResponse(201, {
      success: true,
      message: "Login successful",
      user: parent
    }, "Parent created successfully"));
}



// get parent
const loginParent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    const parent = await findParentByEmail(email);
    if (!parent) {
      throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await parent.matchPassword(password);
    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }
    const token = generateToken(parent._id);

    res.cookie("schoolHubToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful",
      user: parent,
    });

  } catch (err) {
    console.error('Parent login error:', err && err.message ? err.message : err);
    return res.status(err && err.statusCode ? err.statusCode : 400).json({
      success: false,
      message: err && err.message ? err.message : "Login failed",
    });
  }

}


const getParent = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });


}

const logout = (req, res) => {
  res.clearCookie("schoolHubToken", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  createParent,
  loginParent,
  getParent,
  logout,
};
