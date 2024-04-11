import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    latitude: Number,
    longitude: Number,
    timestamp: { type: Date, default: Date.now }
  });

const Location = mongoose.model('Location', LocationSchema);
export default Location