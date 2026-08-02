// src/constants/academic.constants.js

// Reuse your existing GUJARAT_DISTRICTS / TALUKAS_BY_DISTRICT from
// filterOptions.js if you already have them — importing here just keeps
// this file self-contained. Replace this import with your real path:
// const { GUJARAT_DISTRICTS } = require("../config/filterOptions");

const GENDER = ["Male", "Female", "Other"];

const MEDIUM = ["Gujarati", "English", "Hindi"];

const RELATION = ["FATHER", "MOTHER", "GUARDIAN"];

// Standard/class options — adjust if your platform also covers pre-primary
// differently or goes beyond 12th.
const STANDARDS = [
  "Nursery",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

// Matches "2025-26" or "2025-2026" style academic years
const ACADEMIC_YEAR_REGEX = /^\d{4}-\d{2,4}$/;

// Indian mobile number: optional +91 / 0 prefix, then 10 digits starting 6-9
const MOBILE_REGEX = /^(?:\+91|0)?[6-9]\d{9}$/;

module.exports = {
  GENDER,
  MEDIUM,
  RELATION,
  STANDARDS,
  ACADEMIC_YEAR_REGEX,
  MOBILE_REGEX,
};
