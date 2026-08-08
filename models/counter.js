// utils/counter.js

const counter = require("../models/counter");

const getNextSequence = async (name) => {
  const counter = await counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

module.exports = { getNextSequence };