import { Schema, model } from 'mongoose';
import Doctor from "./Doctor.js";

const Review = new Schema(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewText: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
}
);

Review.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'username photo'
  })
  next()
})

Review.statics.calcAverageRatings = async function (doctorId) {
  const stats = await this.aggregate([
    {
      $match: { doctor: doctorId }
    },
    {
      $group: {
        _id: '$doctor',
        numOfRating: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ])
  await Doctor.findByIdAndDelete(doctorId,{
    totalRating:stats[0].numOfRating,
    averageRating:stats[0].avgRating
  })
}

Review.post('save',function(){
  this.constructor.calcAverageRatings(this.doctor)
})

export default model("Review", Review);
