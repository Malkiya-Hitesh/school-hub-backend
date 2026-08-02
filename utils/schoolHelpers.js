// utils/schoolHelpers.js
// Pure functions — no DB calls — so they're easy to unit test and to
// reuse from the pre-save hook, a bulk-import script, or an admin "regenerate" button.

const MANAGEMENT_LABELS = {
  PRIVATESCHOOL: "Private",
  GOVERNMENTSCHOOL: "Government",
  GOVERNMENTAIDEDSCHOOL: "Government-aided",
  CENTRALGOVERNMENTSCHOOL: "Central Government",
  SPECIALGOVERNMENTSCHOOL: "Special Government",
  RECOGNIZEDMADARSA: "Recognized Madarsa",
};

const BOARD_LABELS = {
  CBSE: "CBSE",
  ICSE: "ICSE",
  STATEBOARD: "State-recognized",
  INTERNATIONALBOARD: "International",
};

const titleCase = (str) => {
  if (!str) return str;
  return str
    .toString()
    .toLowerCase()
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
};

// ── Student-teacher ratio ───────────────────────────────────
const calculateStudentTeacherRatio = (totalStudents = 0, totalTeachers = 0) => {
  if (!totalTeachers || totalTeachers <= 0) return null;
  return Math.round((totalStudents / totalTeachers) * 100) / 100;
};

// ── about.description ───────────────────────────────────────
const generateAboutDescription = (school) => {
  const name = titleCase(school?.basics?.schoolName) || "This school";
  const managementLabel = MANAGEMENT_LABELS[school?.category?.management] || "";
  const village = school?.address?.village ? titleCase(school.address.village) : null;
  const taluka = school?.address?.taluka ? titleCase(school.address.taluka) : null;
  const district = school?.address?.district ? titleCase(school.address.district) : null;
  const state = school?.address?.state ? titleCase(school.address.state) : "Gujarat";
  const year = school?.basics?.establishedYear;
  const gradeFrom = school?.academics?.gradeFrom;
  const gradeTo = school?.academics?.gradeTo;
  const board = (school?.academics?.board || []).filter(Boolean)[0];
  const boardLabel = BOARD_LABELS[board] || "state-recognized";
  const medium = (school?.academics?.medium || []).filter(Boolean)[0];
  const students = school?.academics?.totalStudents;
  const teachers = school?.academics?.totalTeachers;

  const locationBits = [village, taluka ? `${taluka} taluka` : null, district ? `${district} district` : null, state]
    .filter(Boolean)
    .join(", ");

  const sentence1 = `${name} is a${managementLabel ? ` ${managementLabel}` : ""} school${
    locationBits ? ` located in ${locationBits}` : ""
  }.`;

  let sentence2 = "";
  if (year) sentence2 += `Established in ${year}, `;
  if (gradeFrom != null && gradeTo != null) {
    sentence2 += `${sentence2 ? "offering" : "Offering"} education from grade ${gradeFrom} to grade ${gradeTo} `;
  }
  if (board) sentence2 += `under the ${boardLabel} board, `;
  if (medium) sentence2 += `with ${titleCase(medium)} as the medium of instruction.`;
  sentence2 = sentence2.trim().replace(/,$/, ".");

  let sentence3 = "";
  if (students || teachers) {
    sentence3 = `The school currently has around ${students || 0} students and ${teachers || 0} teacher${
      teachers === 1 ? "" : "s"
    }.`;
  }

  return [sentence1, sentence2, sentence3].filter(Boolean).join(" ");
};

// ── seo.title / seo.description / seo.keywords ─────────────
const generateSeoDefaults = (school) => {
  const name = titleCase(school?.basics?.schoolName) || "School";
  const district = school?.address?.district ? titleCase(school.address.district) : null;
  const taluka = school?.address?.taluka ? titleCase(school.address.taluka) : null;
  const locationType = (school?.category?.locationType || "").toLowerCase();
  const managementLabel = MANAGEMENT_LABELS[school?.category?.management] || "";
  const medium = (school?.academics?.medium || []).filter(Boolean)[0];
  const board = (school?.academics?.board || []).filter(Boolean)[0];
  const boardLabel = BOARD_LABELS[board] || "state-recognized";
  const gradeFrom = school?.academics?.gradeFrom;
  const gradeTo = school?.academics?.gradeTo;

  const title = `${name}${district ? ` - School in ${district}` : ""}`;

  const description = `${name} is a${locationType ? ` ${locationType}` : ""}${
    managementLabel ? ` ${managementLabel}` : ""
  } school${taluka ? ` in ${taluka}` : ""}${district ? `, ${district}` : ""}${
    medium ? ` offering ${titleCase(medium)} medium education` : ""
  }${gradeFrom != null && gradeTo != null ? ` (grade ${gradeFrom}-${gradeTo})` : ""}${
    board ? ` under ${boardLabel} board.` : "."
  }`;

  const keywords = [
    name.toLowerCase(),
    district ? `schools in ${district.toLowerCase()}` : null,
    taluka ? `schools in ${taluka.toLowerCase()}` : null,
    medium && district ? `${medium.toLowerCase()} medium school ${district.toLowerCase()}` : null,
    district ? `best schools in ${district.toLowerCase()}` : null,
  ].filter(Boolean);

  return { title, description, keywords };
};

// ── profile.completion (0-100) ──────────────────────────────
const calculateProfileCompletion = (school) => {
  const social = school?.social || {};
  const hasAnySocialLink = Object.values(social).some((v) => typeof v === "string" && v.trim());

  const checks = [
    !!school?.basics?.logo,
    !!school?.basics?.coverImage,
    !!school?.basics?.trustName,
    !!school?.basics?.principalName,
    !!school?.about?.tagline,
    !!school?.about?.description,
    !!school?.about?.vision,
    !!school?.about?.mission,
    !!school?.address?.full,
    !!(school?.address?.geo?.coordinates?.length === 2),
    !!(school?.contact?.phone && school.contact.phone.length > 0),
    !!school?.contact?.email,
    !!school?.contact?.website,
    !!(school?.academics?.board || []).filter(Boolean).length,
    !!(school?.academics?.medium || []).filter(Boolean).length,
    !!school?.category?.management,
    hasAnySocialLink,
    !!school?.verification?.isVerified,
  ];

  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
};

module.exports = {
  MANAGEMENT_LABELS,
  BOARD_LABELS,
  calculateStudentTeacherRatio,
  generateAboutDescription,
  generateSeoDefaults,
  calculateProfileCompletion,
};