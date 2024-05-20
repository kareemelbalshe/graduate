import { Schema, model } from 'mongoose';

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
    // Define the price of the booking ticket
    ticketPrice: { type: Number, required: true },
    // Define the status of the booking (pending, approved, cancelled)
    status: {
      type: String,
      enum: ["pending", "approved", "cancelled"], // Possible values for status
      default: "pending", // Default status is pending
    },
    // Define the time of the booking
    time: {
      type: Date // Date and time of the booking
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

// Create a Mongoose model based on the Booking schema
export default model("Booking", BookingSchema);
