import { Schema, model } from 'mongoose';
import Joi from 'joi';

// Define the Doctor schema
const Doctor = new Schema({
    // Reference to the user who is a doctor
    user: {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
    },
    clinic: [{ type: Schema.Types.ObjectId, ref: "Location" }],
    // Specialization of the doctor
    specialization: {
        type: String,
        enum: [
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
        ],
    },
    // Degree of the doctor
    degree: {
        type: String,
        enum: ["Intern", "Resident", "Specialist", "SeniorSpecialist", "Consultant", "SeniorConsultant", "Professor"],
    },
    // Price of the doctor's consultation ticket
    ticketPriceClinic: { type: Number },
    ticketPriceHome: { type: Number },
    // Hospital where the doctor works
    hospital: { type: String },
    // Users who liked the doctor
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "User" // Reference to the User model
        }
    ],
    // Experiences of the doctor
    experiences: { type: String },
    // Biography of the doctor
    bio: { type: String, maxLength: 200 },
    // Reviews given to the doctor
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }], // Reference to the Review model
    // Average rating of the doctor
    averageRating: {
        type: Number,
        default: 0,
    },
    // Total rating of the doctor
    totalRating: {
        type: Number,
        default: 0,
    },
    // Bookings made to the doctor
    booking: [{ type: Schema.Types.ObjectId }]
}, {
    // Enable timestamps to automatically add createdAt and updatedAt fields
    timestamps: true,
    // Configure JSON serialization to include virtual properties
    toJSON: { virtuals: true },
    // Configure object serialization to include virtual properties
    toObject: { virtuals: true }
});

// Validation function using Joi
export const validateDoctor = function (obj) {
    const schema = Joi.object({
        specialization: Joi.string().valid(
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
            "CardiothoracicSurgeon"
        ),
        degree: Joi.string().valid(
            "Intern",
            "Resident",
            "Specialist",
            "SeniorSpecialist",
            "Consultant",
            "SeniorConsultant",
            "Professor"
        ),
        ticketPriceClinic: Joi.number(),
        ticketPriceHome: Joi.number(),
        hospital: Joi.string().optional(),
        experiences: Joi.string().optional(),
        bio: Joi.string().max(200).optional(),
    });
    return schema.validate(obj);
};

// Create a Mongoose model based on the Doctor schema
export default model("Doctor", Doctor);
