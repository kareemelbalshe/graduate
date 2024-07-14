import { Schema, model } from 'mongoose';
import Joi from 'joi';

// Define the History schema
const History = new Schema({
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 200,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    date: {
        type: Date,
    },
    category: {
        type: String,
        required: true,
        enum: ["t7alel", "rojeta", "ashe3a"],
    },
    image: {
        type: Object,
        default: {
            url: "",
            publicId: null,
        }
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


// Validation function using Joi
export const validateHistory = function (obj) {
    const schema = Joi.object({
        description: Joi.string().trim().min(10).max(200).required(),
        date: Joi.date().optional(),
        category: Joi.string().valid("t7alel", "rojeta", "ashe3a").required(),
    });
    return schema.validate(obj);
};

// Create a Mongoose model based on the History schema
export default model('History', History);
