import { Schema, model } from 'mongoose';

// Define a Mongoose schema for the Booking model
const ChatbotSchema = new Schema(
    {
        // Define a reference to the user who makes the booking
        user: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        welcome: {},
        disease_input: {
            type: String
        },
        resDisease_input: {},
        conf_inp: {
            type: String
        },
        resConf_inp: {},
        num_days: {
            type: String
        },
        resNum_days: {},
        inp: { type: String },
        resInp: {}
    },
    {
        // Enable timestamps to automatically add createdAt and updatedAt fields
        timestamps: true,
        // Configure JSON serialization to include virtual properties
        toJSON: { virtuals: true },
        // Configure object serialization to include virtual properties
        toObject: { virtuals: true }
    }
);

// Create a Mongoose model based on the Booking schema
export default model("Chatbot", ChatbotSchema);
