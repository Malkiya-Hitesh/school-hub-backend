const AppError = require("../utils/appError");

const {
findUserByEmail,
createUser,
updateUserProfile,
findUserByIdWithPassword,
} = require("../services/auth.service");

const { generateToken } = require("../middleware/auth");

const sanitizeUser = (user) => ({
_id: user._id,
name: user.name,
email: user.email,
phone: user.phone,
role: user.role,
schoolId: user.schoolId,
isActive: user.isActive,
createdAt: user.createdAt,
});

// Register
const register = async (req, res, next) => {
try {
const { name, email, password, phone } = req.body;


if (!name?.trim() || !email?.trim() || !password) {
  throw new AppError("Name, email and password are required", 400);
}

const existing = await findUserByEmail(email);

if (existing) {
  throw new AppError("Email already registered", 409);
}

const user = await createUser({
  name,
  email,
  password,
  phone,
});

const token = generateToken(user._id);

res.cookie("schoolHubToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

res.status(201).json({
  success: true,
  message: "Account created successfully",
  user: sanitizeUser(user),
});


} catch (err) {
next(err);
}
};

// Login
const login = async (req, res, next) => {
try {
const { email, password } = req.body;


const user = await findUserByEmail(email);

if (!user) {
  throw new AppError("Invalid credentials", 401);
}

const isMatch = await user.matchPassword(password);

if (!isMatch) {
  throw new AppError("Invalid credentials", 401);
}

user.lastLoginAt = new Date();
await user.save({ validateBeforeSave: false });

const token = generateToken(user._id);

res.cookie("schoolHubToken", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

res.json({
  success: true,
  message: "Login successful",
  user: sanitizeUser(user),
});


} catch (err) {
next(err);
}
};

// Get current user
const getMe = async (req, res) => {
res.json({
success: true,
user: sanitizeUser(req.user),
});
};

// Update profile
const updateMe = async (req, res, next) => {
try {
const updates = {};


if (req.body.name?.trim()) {
  updates.name = req.body.name.trim();
}

if (req.body.phone?.trim()) {
  updates.phone = req.body.phone.trim();
}

if (Object.keys(updates).length === 0) {
  throw new AppError("Nothing to update", 400);
}

const user = await updateUserProfile(req.user._id, updates);

res.json({
  success: true,
  message: "Profile updated successfully",
  user: sanitizeUser(user),
});


} catch (err) {
next(err);
}
};

// Change password
const changePassword = async (req, res, next) => {
try {
const { currentPassword, newPassword } = req.body;


if (!currentPassword || !newPassword) {
  throw new AppError(
    "Current password and new password are required",
    400
  );
}

if (newPassword.length < 6) {
  throw new AppError(
    "New password must be at least 6 characters",
    400
  );
}

const user = await findUserByIdWithPassword(req.user._id);

const isMatch = await user.matchPassword(currentPassword);

if (!isMatch) {
  throw new AppError("Current password incorrect", 401);
}

user.password = newPassword;

await user.save();

res.json({
  success: true,
  message: "Password changed successfully",
});


} catch (err) {
next(err);
}
};

// Logout
const logout = (req, res) => {
res.clearCookie("schoolHubToken", {
httpOnly: true,
sameSite: "lax",
secure: process.env.NODE_ENV === "production",
});

res.json({
success: true,
message: "Logged out successfully",
});
};

module.exports = {
register,
login,
getMe,
updateMe,
changePassword,
logout,
};
