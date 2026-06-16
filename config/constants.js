const LIST_PROJECTION = {
  _id:                      1,
  schoolId:                 1,
  slug:                     1,
  status:                   1,
  isClaimed:                1,
  isVerified:               1,
  // basics — important display fields only
  "basics.schoolName":      1,
  "basics.logoImg":         1,
  "basics.description":     1,
  "basics.trustName":       1,
  "basics.phone":           1,
  "basics.email":           1,
  "basics.website":         1,
  // address
  "address.village":        1,
  "address.taluka":         1,
  "address.district":       1,
  "address.state":          1,
  "address.googleMapsUrl":  1,
  // category
  "category.type":          1,
  "category.management":    1,
  "category.locationType":  1,
  "category.schoolType":    1,
  // academics — key fields
  "academics.gradeFrom":    1,
  "academics.gradeTo":      1,
  "academics.medium":       1,
  "academics.board":        1,
  "academics.totalStudents":1,
  // meta
  "meta.seo":               1,
  "meta.search.boostScore": 1,
};
