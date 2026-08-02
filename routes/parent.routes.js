// src/routes/parent.routes.js
const express = require("express");
const { createParent, loginParent, getParent, logout } = require("../controllers/parent.controller");
const { verifyJWT, verifyJWTParent } = require("../middleware/auth.middleware");
const router = express.Router();

router.post("/", createParent);
router.post("/login", loginParent);

router.get('/me'  ,verifyJWTParent, getParent)
router.post("/logout", logout);

module.exports = router;
