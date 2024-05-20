import { Schema, model } from 'mongoose';
import Doctor from "./Doctor.js";

// Define the Review schema
const Review = new Schema(
  {
    // Reference to the doctor being reviewed
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
    },
    // Reference to the user who wrote the review
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    // The text content of the review
    reviewText: {
      type: String,
      required: true,
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

// Create a Mongoose model based on the Review schema
export default model("Review", Review);
