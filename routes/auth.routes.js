const express = require("express");
const router = express.Router();

const {
register,
login,
getMe,
updateMe,
changePassword,
logout,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth");

const {
validateRegister,
validateLogin,
} = require("../validators/auth.validator");

router.post("/register", validateRegister, register);

router.post("/login", validateLogin, login);

router.get("/me", protect, getMe);

router.patch("/me", protect, updateMe);

router.patch("/change-password", protect, changePassword);

router.post("/logout", logout);

module.exports = router;
