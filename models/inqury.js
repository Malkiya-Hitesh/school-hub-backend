const mongoose = require("mongoose");
const { STANDARDS, MOBILE_REGEX, GENDER } = require("../constants/academic.constants");

const { Schema } = mongoose;
const inqurySchema = new Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
          
            trim: true,
            lowercase: true,
            validate: {
                validator: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
                message: "Please provide a valid email address",
            },
        },
        name: {
            type: String,
            required: [true, "your name  is   is required"],

            trim: true,
            lowercase: true,


        },

        apllyClass: {
            type: String,
            required: [true, "Current standard/class is required"],
            enum: {
                values: STANDARDS,
                message: "Please select a valid standard/class",
            },
        },
        curentSchool: {
            type: String,
            trim: true,
            default: null,
        },
        gender: {
            type: String,
            required: [true, "Gender is required"],
            enum: {
                values: GENDER,
                message: "Gender must be Male, Female, or Other",
            },
        },
        mobileNumber: {
            type: String,
            required: [true, "Mobile number is required"],
            trim: true,
            validate: {
                validator: (v) => MOBILE_REGEX.test(v),
                message: (props) =>
                    `${props.value} is not a valid Indian mobile number`,
            },
            index: true,
        },
        schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      default: null,
    },
        address: {
            district: {
                type: String,
                required: [true, "District is required"],
                trim: true,
            },
            taluka: {
                type: String,
                required: [true, "Taluka is required"],
                trim: true,
            },
            villageOrCity: {
                type: String,
                required: [true, "Village/City is required"],
                trim: true,
            },
            fullAddress: {
                type: String,
                trim: true,
                default: null,
            },
        },
    },
    { timestamps: true },
)

module.exports = mongoose.model("inqury", inqurySchema);
