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
        schoolId,

        userId,
        userModel,



    } = req.body;
    if (!name || !email || !apllyClass || !mobileNumber || !gender) {
        return res.status(400).json(
            new ApiResponse(
                400,
                null,
                "Please provide all required fields: name, email, apllyClass, mobileNumber, gender"
            )
        );
    }
let userModelLet ="Student"
    if (userModel == "students") {
        userModelLet = "Student";
    }
    if (userModel == "parents") {
        userModelLet = "Parent";
    }
    console.log(email,
        apllyClass,
        curentSchool,
        mobileNumber,
        address,
        gender,
        schoolId,

        userId,
        userModelLet,
    );

    const student = await inqury.create({
        schoolId,
        userId,
        userModel: userModelLet,
        role: userModelLet,
        name,
        email,
        apllyClass,
        curentSchool,
        mobileNumber,
        address,
        gender,

    });




    return res
        .status(201)
        .json(new ApiResponse(201, student, " inqury  created successfully"));
});



module.exports = {
    postInqury
};
