// services/auth.service.js

const User = require("../models/User");

const findUserByEmail = async (email) => {
  return await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");
};

const createUser = async ({
  name,
  email,
  password,
  phone,
}) => {
  return await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone?.trim() || null,
  });
};

const updateUserProfile = async (userId, updates) => {
  return await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );
};

const findUserByIdWithPassword = async (userId) => {
  return await User.findById(userId).select("+password");
};

module.exports = {
  findUserByEmail,
  createUser,
  updateUserProfile,
  findUserByIdWithPassword,
};