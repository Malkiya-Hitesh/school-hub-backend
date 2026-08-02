// services/parentAuth.service.js
const Parent = require("../models/parent.model");

const findParentByEmail =async (email) => {
  return await Parent.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");
};

const createParent = (data) => Parent.create(data);

const findParentByIdWithPassword = (id) => Parent.findById(id).select("+password");

const updateParentProfile = (id, updates) =>
  Parent.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

module.exports = {
  findParentByEmail,
  createParent,
  findParentByIdWithPassword,
  updateParentProfile,
};