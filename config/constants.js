// config/constants.js

const LIST_PROJECTION = {
  _id: 1,
  schoolId: 1,
  slug: 1,
  "status.type": 1,
  "claim.isClaimed": 1,
  "verification.isVerified": 1,

  "basics.schoolName": 1,
  "basics.logo": 1,
  "basics.trustName": 1,

  "about.tagline": 1,

  "contact.phone": 1,
  "contact.email": 1,
  "contact.website": 1,

  "address.village": 1,
  "address.taluka": 1,
  "address.district": 1,
  "address.state": 1,
  "address.geo.googleMapsUrl": 1,

  "category.management": 1,
  "category.locationType": 1,
  "category.schoolType": 1,

  "academics.gradeFrom": 1,
  "academics.gradeTo": 1,
  "academics.medium": 1,
  "academics.board": 1,
  "academics.totalStudents": 1,

  "admission.isOpen": 1,

  "seo.title": 1,
  "seo.description": 1,

  "profile.completion": 1,
};

module.exports = {
  LIST_PROJECTION,
};