import { Schema, model } from 'mongoose';
import Joi from 'joi';

// Define the Report schema
const Report = new Schema({
    // Description of the report
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 200,
    },
    // Reference to the user who filed the report
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // Reference to the entity being reported (user, message, review, history)
    about: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    // Type of the entity being reported (user, message, review, history)
    kind: {
        type: String,
        enum: ["user", "message", "review", "history"],
        required: true,
    }
}, {
    // Enable timestamps to automatically add createdAt and updatedAt fields
    timestamps: true,
    // Configure JSON serialization to include virtual properties
    toJSON: { virtuals: true },
    // Configure object serialization to include virtual properties
    toObject: { virtuals: true }
});

// Validation function using Joi
export const validateReport = function (obj) {
    const schema = Joi.object({
        description: Joi.string().trim().min(10).max(200).required(),
    });
    return schema.validate(obj);
};

// Create a Mongoose model based on the Report schema
export default model('Report', Report);
