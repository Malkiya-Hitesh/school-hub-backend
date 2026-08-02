const inqury = require("../models/inqury");
const reviews = require("../models/reviews");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");





const postReviews = asyncHandler(async (req, res) => {





    const {
        name,
        rating,
        date,
        comment,
        schoolId



    } = req.body;

    const rewiews = await reviews.create({
         name,
        rating,
        date,
        comment,
        schoolId

    });




    return res
        .status(201)
        .json(new ApiResponse(201, rewiews, " inqury  created successfully"));
});


const getReviews = asyncHandler(async (req , res) => {
    const {id }= req.query
   
    
    const reviewsdata = await reviews.find({schoolId:id})


     return res
        .status(201)
        .json(new ApiResponse(201, reviewsdata, "rewiews"));

})


module.exports = {
  postReviews,
  getReviews
};
