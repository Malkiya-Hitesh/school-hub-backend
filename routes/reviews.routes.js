
const express = require("express");
const { postReviews, getReviews } = require("../controllers/reviews.controller");


const router = express.Router();



router.post("/",postReviews );
router.get("/", getReviews );


module.exports = router;
