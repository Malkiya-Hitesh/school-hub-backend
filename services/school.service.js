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
            key: "address.geo",// existing district/medium/board filters અહીં જ apply થાય
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

const getSchoolBySlugService = async (slug) => {
  return await School.findOne({ slug: slug.trim().toLowerCase(), status: "active" }).lean();
};

const getSchoolBySchoolIdService = async (schoolId) => {
  return await School.findOne({ schoolId, status: "active" }).lean();
};

const getSchoolByMongoIdService = async (id) => {
  return await School.findOne({ _id: id, status: "active" }).lean();
};

module.exports = {
  getSchoolsService,
  getSchoolBySlugService,
  getSchoolBySchoolIdService,
  getSchoolByMongoIdService,
};