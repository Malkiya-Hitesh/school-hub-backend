const School = require("../models/School");

const getNearbySchoolsService = async ({
  lat,
  lng,
  radius,
  limit,
  projection,
}) => {
  return await School.find(
    {
      "address.geo": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radius * 1000,
        },
      },
      status: "active",
    },
    projection
  )
    .limit(limit)
    .lean();
};

const getSchoolBySlugService = async (slug) => {
  return await School.findOne({
    slug: slug.trim().toLowerCase(),
    status: "active",
  }).lean();
};

const getSchoolBySchoolIdService = async (schoolId) => {
  return await School.findOne({
    schoolId,
    status: "active",
  }).lean();
};

const getSchoolByMongoIdService = async (id) => {
  return await School.findOne({
    _id: id,
    status: "active",
  }).lean();
};

const getSchoolsService = async ({
  filter,
  projection,
  sortQuery,
  skip,
  limit,
}) => {
  const [schools, total] = await Promise.all([
    School.find(filter, projection)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),

    School.countDocuments(filter),
  ]);

  return {
    schools,
    total,
  };
};

module.exports = {
  getNearbySchoolsService,
  getSchoolBySlugService,
  getSchoolBySchoolIdService,
  getSchoolByMongoIdService,
  getSchoolsService,
};