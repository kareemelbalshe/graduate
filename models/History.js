import { Schema, model } from 'mongoose';

// Define the History schema
const History = new Schema({
    // Description of the medical history
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 200,
    },
    // Reference to the user associated with the history
    user: {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        required: true,
    },
    // Reference to the doctor associated with the history
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to the User model
        default: "Not at app", // Default value if not specified
    },
    // Date of the medical history
    date: {
        type: Date,
    },
    // Category of the medical history
    category: {
        type: String,
        required: true,
        enum: ["t7alel", "rojeta", "ashe3a"], // Allowed values
    },
    // Image associated with the medical history
    image: {
        type: Object,
        default: {
            url: "",
            publicId: null,
        }
    },
}, {
    // Enable timestamps to automatically add createdAt and updatedAt fields
    timestamps: true,
    // Configure JSON serialization to include virtual properties
    toJSON: { virtuals: true },
    // Configure object serialization to include virtual properties
    toObject: { virtuals: true }
});

// Create a Mongoose model based on the History schema
export default model('History', History);
