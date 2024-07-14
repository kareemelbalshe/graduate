import { Schema, model } from 'mongoose';
import Joi from 'joi';
import Doctor from './Doctor.js';
import User from './User.js';

// Define the Review schema
const Review = new Schema(
  {
    // Reference to the doctor being reviewed
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    // Reference to the user who wrote the review
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // The text content of the review
    reviewText: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 1000,
    },
    // The rating given in the review
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    // Enable timestamps to automatically add createdAt and updatedAt fields
    timestamps: true,
    // Configure JSON serialization to include virtual properties
    toJSON: { virtuals: true },
    // Configure object serialization to include virtual properties
    toObject: { virtuals: true }
  }
);

// Validation function using Joi
export const validateReview = function (obj) {
    const schema = Joi.object({
        reviewText: Joi.string().trim().min(5).max(1000).required(),
        rating: Joi.number().min(0).max(5).required(),
    });
    return schema.validate(obj);
};

// Create a Mongoose model based on the Review schema
export default model("Review", Review);
