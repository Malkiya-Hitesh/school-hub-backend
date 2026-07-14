const dotenv = require("dotenv");

dotenv.config();

module.exports = {
NODE_ENV: process.env.NODE_ENV,
PORT: process.env.PORT,
MONGO_URI: process.env.MONGO_URI,
ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
JWT_SECRET: process.env.JWT_SECRET,
JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
EMAIL_USER: process.env.EMAIL_USER,
EMAIL_PASS: process.env.EMAIL_PASS,
};
