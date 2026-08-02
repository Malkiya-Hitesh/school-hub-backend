// utils/googleAuth.js
// Verifies a Google ID token (credential) sent from the frontend
// via Google Identity Services (accounts.google.com/gsi/client)

const { OAuth2Client } = require("google-auth-library");
const AppError = require("./appError");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID token and returns the decoded payload.
 * Throws AppError if invalid/expired/unverified.
 */
const verifyGoogleToken = async (idToken) => {
  if (!idToken) {
    throw new AppError("Google credential is required", 400);
  }

  let ticket;
  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch (err) {
    throw new AppError("Invalid or expired Google credential", 401);
  }

  const payload = ticket.getPayload();

  if (!payload?.email_verified) {
    throw new AppError("Google email is not verified", 401);
  }

  return payload; // { sub, email, name, picture, email_verified, ... }
};

module.exports = { verifyGoogleToken };