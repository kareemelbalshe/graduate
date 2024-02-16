import { Schema, model } from 'mongoose';

const Doctor = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    ticketPrice: { type: Number },
    hospital:{type:String},
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    isLike:{
        type:Boolean
    },
    // Fields for doctors only
    specialization: { type: String },
    qualifications: {
        type: Array,
    },

    experiences: {
        type: Array,
    },
    location: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: {
          type: [Number],
          index: '2dsphere'
        },
        formattedAddress: String
      },
    bio: { type: String, maxLength: 50 },
    about: { type: String },
    timeSlots: { type: Array },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    averageRating: {
        type: Number,
        default: 0,
    },
    totalRating: {
        type: Number,
        default: 0,
    },
    // appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
});

Doctor.pre('save', async function(next) {
    const loc = await geocoder.geocode(this.address);
    this.location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress
    };

    // Do not save address
    this.address = undefined;
    next();
  });

export default model("Doctor", Doctor);
