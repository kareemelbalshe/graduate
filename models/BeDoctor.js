import { Schema, model } from 'mongoose';
import Joi from 'joi';

// Define the BeDoctor schema
const BeDoctorSchema = new Schema({
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true, // Ensure email is unique
    },
}, {
    // Enable timestamps to automatically add createdAt and updatedAt fields
    timestamps: true,
    // Configure JSON serialization to include virtual properties
    toJSON: { virtuals: true },
    // Configure object serialization to include virtual properties
    toObject: { virtuals: true }
});

// Validation function using Joi
export const validateBeDoctor = (obj) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
    });
    return schema.validate(obj);
};

// Create a Mongoose model based on the BeDoctor schema
export default model('BeDoctor', BeDoctorSchema);
