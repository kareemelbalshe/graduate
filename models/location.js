import mongoose from 'mongoose';
import Joi from 'joi';

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
  time: [
    {
      id: { type: String },
      // Each time slot contains day, from, and to properties
      day: { type: String }, // Day of the week
      from: { type: String }, // Start time
      to: { type: String }, // End time
    }
  ],
  timeSlots: [{
    id: { type: String },
    taken: { type: Boolean, default: false },
    // Each time slot contains day, from, and to properties
    day: { type: String }, // Day of the week
    from: { type: String }, // Start time
    to: { type: String }, // End time
    date: { type: Date, default: Date.now } // Store the full date and time, default to current time
  }],
}, {
  // Enable timestamps to automatically add createdAt and updatedAt fields
  timestamps: true,
  // Configure JSON serialization to include virtual properties
  toJSON: { virtuals: true },
  // Configure object serialization to include virtual properties
  toObject: { virtuals: true }
});

// Validation function using Joi
export const validateLocation = function (obj) {
  const schema = Joi.object({
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    address: Joi.string().required(),
  });
  return schema.validate(obj);
};

// Create a Mongoose model based on the Location schema
const Location = mongoose.model('Location', LocationSchema);
export default Location;
