// src/utils/ApiResponse.js
// Skip this file if you already have an ApiResponse util — same standard shape.
class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

module.exports = { ApiResponse };
