// utils/geo.js

const parseGeoParams = (query) => {
  if (query.lat === undefined || query.lng === undefined) return null;

  const lat = parseFloat(query.lat);
  const lng = parseFloat(query.lng);

  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  // Accept either "radius" or "nearRadius" query param name
  const rawRadius = query.radius ?? query.nearRadius;
  const radius = Math.min(50, Math.max(0.1, parseFloat(rawRadius) || 10));

  return { lat, lng, radius };
};

module.exports = { parseGeoParams };