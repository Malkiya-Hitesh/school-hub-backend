// utils/counter.js
const counter = require("../models/counter");

/**
 * Atomically returns the next number in a named sequence.
 * findOneAndUpdate with upsert is atomic in MongoDB, so this is safe
 * under concurrent school creations — no race condition on schoolId.
 *
 * If you want new schoolIds to continue from your existing UDISE range
 * (your sample doc is 4200013), seed it once before going live:
 *   db.counters.insertOne({ _id: "schoolId", seq: 4300000 })
 * Otherwise it starts counting up from 1.
 */
const getNextSequence = async (name) => {
  const counter = await counter.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

module.exports = { getNextSequence };