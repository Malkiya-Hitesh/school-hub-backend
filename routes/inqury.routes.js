// src/routes/student.routes.js
const express = require("express");
const { postInqury } = require("../controllers/inqury.controller");

const router = express.Router();



router.post("/",postInqury );
router.get("/", );


module.exports = router;
