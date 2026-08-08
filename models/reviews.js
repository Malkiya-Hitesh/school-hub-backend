const mongoose = require("mongoose");

const { Schema } = mongoose;
const reviewsSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, "your name  is   is required"],

            trim: true,
            lowercase: true,


        },
        schoolId: {
            type: Schema.Types.ObjectId,
            ref: "School",
            default: null,
        },
        userId: {
            type: Schema.Types.ObjectId,
            refPath: "userModel",
            default: null,
        },

        userModel: {
            type: String,
            enum: ["Student", "Parent"],
            default: null,
        },
        role: {
            type: String,
            default: "Student"
        },
        comment: {
            type: String,
            required: [true, "msg   is   is required"],

            trim: true,
            lowercase: true,


        },
        rating: {
            type: Number,
            required: [true, "rating  is required"],

        },
        date: {
            type: String,

        }

    },
    { timestamps: true },
)

module.exports = mongoose.model("Reviews", reviewsSchema);
