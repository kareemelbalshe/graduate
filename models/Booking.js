import { Schema, model } from 'mongoose';
import Joi from 'joi';

// Define a Mongoose schema for the Booking model
const BookingSchema = new Schema(
  {
    // Define a reference to the doctor who receives the booking
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    // Define a reference to the user who makes the booking
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    kind: { type: String, enum: ["home", "clinic"], required: true, default: "clinic" },
    clinic: { type: Schema.Types.ObjectId, ref: "Location" },
    toPerson: { type: String },
    complaining: { type: String },
    age: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    // Define the price of the booking ticket
    ticketPrice: { type: Number },
    // Define the status of the booking (pending, approved, cancelled)
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled"], // Possible values for status
      default: "pending", // Default status is pending
    },
    // Define the time of the booking
    time: {
      id: String, // Id of the time slot
      day: { type: String }, // Day of the week
      from: { type: String }, // Start time
      to: { type: String }, // End time // Date and time of the booking
    },
    // Define the reason for cancelling the booking
    cancelReason: {
      type: String // Reason for cancelling
    }
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
export const validateBooking = function (obj) {
  const schema = Joi.object({
    kind: Joi.string().valid("home", "clinic").required(),
    toPerson: Joi.string().optional(),
    complaining: Joi.string().optional(),
    age: Joi.string().optional(),
    gender: Joi.string().valid("male", "female", "other").optional(),
    cancelReason: Joi.string().optional()
  });
  return schema.validate(obj);
};

// Create a Mongoose model based on the Booking schema
export default model("Booking", BookingSchema);
