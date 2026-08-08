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
        schoolId,

        userId,
        userModel,



    } = req.body;


    if (!name || !rating || !date || !comment || !schoolId) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Please provide all required fields: name, rating, date, comment, schoolId"
            )
        );
    }
    let userModelLet = "Student";

    if (userModel == "students") {
        userModelLet = "Student";
    }

    if (userModel == "parents") {
        userModelLet = "Parent";
    }
    const rewiews = await reviews.create({
        name,
        rating,
        date,
        comment,
        schoolId,

        userId,
        userModel: userModelLet,
        role: userModelLet
    });




    return res
        .status(201)
        .json(new ApiResponse(201, rewiews, " inqury  created successfully"));
});


const getReviews = asyncHandler(async (req, res) => {
    const { id } = req.query


    const reviewsdata = await reviews.find({ schoolId: id })


    return res
        .status(201)
        .json(new ApiResponse(201, reviewsdata, "rewiews"));

})


module.exports = {
    postReviews,
    getReviews
};
