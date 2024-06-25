import mongoose from "mongoose";

// Define the Location schema
const LocationSchema = new mongoose.Schema({
  // Reference to the user associated with the location
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // Latitude coordinate of the location
  latitude: Number,
  // Longitude coordinate of the location
  longitude: Number,
  // Address of the location
  address: { type: String, required: true },
  // Time slots associated with the location
  timeSlots: [{
    // Each time slot contains day, from, and to properties
    day: { type: String }, // Day of the week
    from: { type: String }, // Start time
    to: { type: String }, // End time
  }],
}, {
  // Enable timestamps to automatically add createdAt and updatedAt fields
  timestamps: true,
  // Configure JSON serialization to include virtual properties
  toJSON: { virtuals: true },
  // Configure object serialization to include virtual properties
  toObject: { virtuals: true }
});

// Create a Mongoose model based on the Location schema
const Location = mongoose.model('Location', LocationSchema);
export default Location;
