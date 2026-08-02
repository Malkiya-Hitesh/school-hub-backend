// src/utils/asyncHandler.js
// Skip this file if you already have an asyncHandler util — same standard shape.
const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
