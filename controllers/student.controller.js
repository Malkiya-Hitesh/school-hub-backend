// src/controllers/student.controller.js



const Student = require("../models/student.model");
const mongoose = require("mongoose");
const { generateToken } = require("../middleware/auth");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const { validateStudent } = require("../validators/student.validator");
const { findStudentByEmail } = require("../services/studentAuth.service");
const AppError = require("../utils/appError");


//  create student
const createStudent = asyncHandler(async (req, res) => {
  

  const errors = validateStudent(req.body);
  if (errors.length){
    console.log("Validation errors:", errors);
throw new ApiError(400, "Validation failed", errors);
  } 


  const {
    email,
    password,
    fullName,
    gender,
    dateOfBirth,
    currentStandard,
    schoolName,
    school,
    medium,
    academicYear,
    address,
  

  } = req.body;

  const student = await Student.create({
    email,
    password,
    fullName,
    gender,
    dateOfBirth,
    currentStandard,
    schoolName: schoolName || null,
    school: school || null,
    medium,
    academicYear,
    address,
    role: "students",

  });


  const token = generateToken(student._id);

  res.cookie("schoolHubToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, student, "Student created successfully"));
});

const loginstudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;


    const student = await findStudentByEmail(email);

    if (!student) {
      throw new AppError("Invalid credentials", 401);
    }

    const isMatch = await student.matchPassword(password);

    if (!isMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    student.lastLoginAt = new Date();
    await student.save({ validateBeforeSave: false });

    const token = generateToken(student._id);

    res.cookie("schoolHubToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Login successful",
     user: student,
    });
  }
  catch (err) {
     res.json({
      success: false,
      message: "Login failed",
    
    });
  }
}











const getstudent = async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });


}




 const logout = (req, res) => {
res.clearCookie("schoolHubToken", {
httpOnly: true,
sameSite: "lax",
secure: process.env.NODE_ENV === "production",
});

res.json({
success: true,
message: "Logged out successfully",
});
};

module.exports = {
  createStudent,
  
  loginstudent,
  getstudent,
  logout
};
