// utils/slugify.js

const slugify = (text = "") =>
  text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Matches your v2 sample: "ekalavy-vidhy-sankul-surat-4200013"
 * schoolName-slug + district-slug + schoolId
 * schoolId is unique, so collisions are effectively impossible —
 * no need for a uniqueness-retry loop.
 */
const generateSlug = ({ schoolName, district, schoolId }) => {
  const parts = [slugify(schoolName), district ? slugify(district) : null, schoolId]
    .filter((p) => p !== null && p !== undefined && p !== "");
  return parts.join("-");
};

module.exports = { slugify, generateSlug };