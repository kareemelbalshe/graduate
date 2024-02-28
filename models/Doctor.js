import { Schema, model } from 'mongoose';

const Doctor = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    specialization: { type: String,
    enum:[
      "General",
      "Cardiologist",
      "Neurologist",
      "Oncologist",
      "Pediatrician",
      "Dermatologist",
      "Gastroenterologist",
      "OrthopedicSurgeon",
      "OB-GYN",
      "Psychiatrist",
      "Endocrinologist",
      "Pulmonologist",
      "Urologist",
      "Ophthalmologist",
      "Radiologist",
      "Anesthesiologist",
      "ENT",
      "Rheumatologist",
      "Nephrologist",
      "InfectiousDisease",
      "Allergist",
      "Hematologist",
      "Pathologist",
      "PlasticSurgeon",
      "CardiothoracicSurgeon",
    ] },
    degree: { type: String, 
      enum: ["Intern", "Resident", "Specialist","SeniorSpecialist","Consultant","SeniorConsultant","Professor"] 
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
    

    experiences: {
        type: String,
    },
    // location: [{
    //     type: {
    //       type: String,
    //       enum: ['Point']
    //     },
    //     coordinates: {
    //       type: [Number],
    //       index: '2dsphere'
    //     },
    //     formattedAddress: String}
    // ],
    bio: { type: String, maxLength: 200 },
    timeSlots: [{type:Object,day:{type:String},from:{type:Date},to:{type:Date}}],
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    averageRating: {
        type: Number,
        default: 0,
    },
    totalRating: {
        type: Number,
        default: 0,
    },
});

// Doctor.pre('save', async function(next) {
//     const loc = await geocoder.geocode(this.address);
//     this.location = {
//       type: 'Point',
//       coordinates: [loc[0].longitude, loc[0].latitude],
//       formattedAddress: loc[0].formattedAddress
//     };

//     // Do not save address
//     this.address = undefined;
//     next();
//   });

export default model("Doctor", Doctor);
