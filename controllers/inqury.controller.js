const inqury = require("../models/inqury");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");





const postInqury = asyncHandler(async (req, res) => {





    const {
        name,
        email,
        apllyClass,
        curentSchool,
        mobileNumber,
        address,
        gender,
        schoolId



    } = req.body;

    const student = await inqury.create({
        schoolId,
        name,
        email,
        apllyClass,
        curentSchool,
        mobileNumber,
        address,
        gender

    });




    return res
        .status(201)
        .json(new ApiResponse(201, student, " inqury  created successfully"));
});



module.exports = {
    postInqury
};
