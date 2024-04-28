import mongoose from "mongoose";

const LocationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    latitude: Number,
    longitude: Number,
    timeSlots: [{type:Object,day:{type:String},from:{type:String},to:{type:String}}],
  }, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

const Location = mongoose.model('Location', LocationSchema);
export default Location