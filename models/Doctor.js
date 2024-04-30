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
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    averageRating: {
        type: Number,
        default: 0,
    },
    totalRating: {
        type: Number,
        default: 0,
    },
    booking:[{ type: Schema.Types.ObjectId }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});



export default model("Doctor", Doctor);
