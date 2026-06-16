const SORT_MAP = {
  students: { "academics.totalStudents": -1 },
  name:     { "basics.schoolName": 1 },
  district: { "address.district": 1 },
  newest:   { createdAt: -1 },
};