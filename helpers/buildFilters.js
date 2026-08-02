// helpers/buildFilters.js

const {
  DISTRICTS, DISTRICT_TALUKAS, MEDIUMS, BOARDS,
  MANAGEMENTS, SCHOOL_TYPES, LOCATION_TYPES,
  GRADE_FROM, GRADE_TO, STREAMS
} = require("./filterOptions");

const buildFilter = (query, { useTextIndex = true } = {}) => {
  const filter = {
    // v2: status is now { type, updatedAt } instead of a flat string
    "status.type": "ACTIVE",
  };

  // ── Full-text search ──────────────────────────────────────
  if (query.q?.trim()) {
    const term = query.q.trim();

    if (term.length >= 5 && useTextIndex) {
      filter.$text = {
        $search: term,
      };
    } else {
      const regex = {
        $regex: term,
        $options: "i",
      };

      filter.$or = [
        { "basics.schoolName": regex },
        { "address.village": regex },
        { "address.taluka": regex },
        { "address.district": regex },
      ];
    }
  }

  // District
  if (query.district && DISTRICTS.includes(query.district)) {
    filter["address.district"] = query.district;
  }

  // Taluka
  if (query.taluka) {
    const taluka = query.taluka.trim().toUpperCase();
    if (query.district && DISTRICT_TALUKAS[query.district]) {
      if (DISTRICT_TALUKAS[query.district].includes(taluka)) {
        filter["address.taluka"] = { $regex: `^${taluka}$`, $options: "i" };
      }
    } else {
      filter["address.taluka"] = { $regex: query.taluka.trim(), $options: "i" };
    }
  }

  // Village
  if (query.village) {
    filter["address.village"] = { $regex: query.village.trim(), $options: "i" };
  }

  // Medium
  if (query.medium && MEDIUMS.includes(query.medium)) {
    filter["academics.medium"] = { $in: [query.medium] };
  }

  // Board
  if (query.board && BOARDS.includes(query.board)) {
    filter["academics.board"] = { $in: [query.board] };
  }

  // Streams
  if (query.streams && STREAMS.includes(query.streams)) {
    filter["academics.streams"] = { $in: [query.streams] };
  }

  // Management
  if (query.management && MANAGEMENTS.includes(query.management)) {
    filter["category.management"] = query.management;
  }

  // School Type
  if (query.schoolType && SCHOOL_TYPES.includes(query.schoolType)) {
    filter["category.schoolType"] = query.schoolType;
  }

  // Location Type
  if (query.locationType && LOCATION_TYPES.includes(query.locationType)) {
    filter["category.locationType"] = query.locationType;
  }

  // Grade From
  if (query.gradeFrom !== undefined) {
    const gf = Number(query.gradeFrom);
    if (!isNaN(gf) && GRADE_FROM.includes(gf)) {
      filter["academics.gradeFrom"] = { $lte: gf };
    }
  }

  // Grade To
  if (query.gradeTo !== undefined) {
    const gt = Number(query.gradeTo);
    if (!isNaN(gt) && GRADE_TO.includes(gt)) {
      filter["academics.gradeTo"] = { $gte: gt };
    }
  }

  // Claimed — v2: claim.isClaimed
  if (query.isClaimed === "true") {
    filter["claim.isClaimed"] = true;
  }

  // Verified — v2: verification.isVerified
  if (query.isVerified === "true") {
    filter["verification.isVerified"] = true;
  }

  // NEW (v2): Admission open filter
  if (query.admissionOpen === "true") {
    filter["admission.isOpen"] = true;
  }

  return filter;
};

module.exports = { buildFilter };