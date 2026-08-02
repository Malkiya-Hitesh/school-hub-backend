// services/studentAuth.service.js
const Student = require("../models/student.model");

const findStudentByEmail =async (email) => {
  return await Student.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");
};

const createStudent = (data) => Student.create(data);

const findStudentByIdWithPassword = (id) => Student.findById(id).select("+password");

const updateStudentProfile = (id, updates) =>
  Student.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

module.exports = {
  findStudentByEmail,
  createStudent,
  findStudentByIdWithPassword,
  updateStudentProfile,
};