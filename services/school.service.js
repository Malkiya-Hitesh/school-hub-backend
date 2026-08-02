// services/school.service.js

const School = require("../models/School");

const getSchoolsService = async ({
  filter,
  projection,
  sortQuery,
  skip,
  limit,
  geo,           // null અથવા { lat, lng, radius }
  explicitSort,  // true જો user એ sortBy manually પસંદ કર્યું હોય
}) => {
  if (geo) {
    const pipeline = [
      {
        $geoNear: {
          near: { type: "Point", coordinates: [geo.lng, geo.lat] },
          distanceField: "distanceMeters",
          maxDistance: geo.radius * 1000,
          spherical: true,
          query: filter,
          key: "address.geo", // existing district/medium/board filters અહીં જ apply થાય
        },
      },
    ];

    // $geoNear default: distance પ્રમાણે sort. User એ manually sort પસંદ કર્યું હોય તો જ override
    if (explicitSort) {
      pipeline.push({ $sort: sortQuery });
    }

    pipeline.push({
      $facet: {
        data: [
          { $skip: skip },
          { $limit: limit },
          { $project: projection },
        ],
        totalCount: [{ $count: "count" }],
      },
    });

    const [result] = await School.aggregate(pipeline);

    return {
      schools: result?.data ?? [],
      total: result?.totalCount?.[0]?.count ?? 0,
    };
  }

  // ── Existing non-geo path — unchanged ──
  const [schools, total] = await Promise.all([
    School.find(filter, projection)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean(),

    School.countDocuments(filter),
  ]);

  return { schools, total };
};

// v2: status is now { type, updatedAt } — filter on "status.type"
const getSchoolBySlugService = async (slug) => {
  return await School.findOne({ slug: slug.trim().toLowerCase(), "status.type": "ACTIVE" }).lean();
};

const getSchoolBySchoolIdService = async (schoolId) => {
  return await School.findOne({ schoolId, "status.type": "ACTIVE" }).lean();
};

const getSchoolByMongoIdService = async (id) => {
  return await School.findOne({ _id: id, "status.type": "ACTIVE" }).lean();
};

// NEW: createSchoolService
// Just builds + saves — schoolId, slug, studentTeacherRatio, about.description,
// seo defaults, and profile.completion are all filled in automatically by the
// pre-validate hook in models/School.js. Uses .save() (not .create() with
// insertMany) so that hook always runs.
const createSchoolService = async (data) => {
  const school = new School(data);
  await school.save();
  return school.toObject();
};

module.exports = {
  getSchoolsService,
  getSchoolBySlugService,
  getSchoolBySchoolIdService,
  getSchoolByMongoIdService,
  createSchoolService,
};