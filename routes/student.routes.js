// src/routes/student.routes.js
const express = require("express");

const router = express.Router();
const { validateStudent } = require("../validators/student.validator");
const { createStudent, loginstudent, getstudent, logout } = require("../controllers/student.controller");
const {  verifyJWTStudent } = require("../middleware/auth.middleware");


router.post("/", createStudent);
router.post("/login", loginstudent);
router.get('/me'  ,verifyJWTStudent, getstudent)
router.post("/logout", logout);

module.exports = router;
