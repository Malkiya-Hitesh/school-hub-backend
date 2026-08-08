// utils/duration.js

const UNIT_MS = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

const parseDurationMs = (value, fallbackMs = 24 * 60 * 60 * 1000) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return fallbackMs;

  const match = value.trim().match(/^(\d+)\s*(ms|s|m|h|d)?$/i);
  if (!match) return fallbackMs;

  const amount = Number(match[1]);
  const unit = (match[2] || "ms").toLowerCase();

  if (unit === "ms") return amount;
  return amount * (UNIT_MS[unit] || 1);
};

module.exports = { parseDurationMs };