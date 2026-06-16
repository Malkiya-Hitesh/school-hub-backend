const buildFilter = (query) => {
  const filter = {};

  // Only active schools
  filter.status = "active";

  // Full-text search
  if (query.q?.trim()) {
    filter.$text = { $search: query.q.trim() };
  }

  // District — exact match from enum list
  if (query.district && DISTRICTS.includes(query.district)) {
    filter["address.district"] = query.district;
  }

  // Taluka — validate against district if both provided
  if (query.taluka) {
    const taluka = query.taluka.trim().toUpperCase();
    if (query.district && DISTRICT_TALUKAS[query.district]) {
      // Only allow valid talukas for that district
      if (DISTRICT_TALUKAS[query.district].includes(taluka)) {
        filter["address.taluka"] = { $regex: `^${taluka}$`, $options: "i" };
      }
    } else {
      filter["address.taluka"] = { $regex: query.taluka.trim(), $options: "i" };
    }
  }

  // Village — partial match
  if (query.village) {
    filter["address.village"] = { $regex: query.village.trim(), $options: "i" };
  }

  // Medium — must be from enum list
  if (query.medium && MEDIUMS.includes(query.medium)) {
    filter["academics.medium"] = { $in: [query.medium] };
  }

  // Board — must be from enum list
  if (query.board && BOARDS.includes(query.board)) {
    filter["academics.board"] = { $in: [query.board] };
  }

  // Management — must be from enum list
  if (query.management && MANAGEMENTS.includes(query.management)) {
    filter["category.management"] = query.management;
  }

  // School type
  if (query.schoolType && SCHOOL_TYPES.includes(query.schoolType)) {
    filter["category.schoolType"] = query.schoolType;
  }

  // Location type
  if (query.locationType && LOCATION_TYPES.includes(query.locationType)) {
    filter["category.locationType"] = query.locationType;
  }

  // Category type
  if (query.categoryType && CATEGORY_TYPES.includes(query.categoryType)) {
    filter["category.type"] = query.categoryType;
  }

  // Grade range — gradeFrom <= requested, gradeTo >= requested
  if (query.gradeFrom !== undefined) {
    const gf = Number(query.gradeFrom);
    if (!isNaN(gf) && GRADE_FROM.includes(gf)) {
      filter["academics.gradeFrom"] = { $lte: gf };
    }
  }
  if (query.gradeTo !== undefined) {
    const gt = Number(query.gradeTo);
    if (!isNaN(gt) && GRADE_TO.includes(gt)) {
      filter["academics.gradeTo"] = { $gte: gt };
    }
  }

  // Claimed / Verified filters
  if (query.isClaimed === "true")  filter.isClaimed  = true;
  if (query.isVerified === "true") filter.isVerified = true;

  return filter;
};