import { Schema, model } from 'mongoose';
import Joi from 'joi';

// Define a Mongoose schema for the Chatbot model
const ChatbotSchema = new Schema(
    {
        // Define a reference to the user who interacts with the chatbot
        user: {
            type: Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        welcome: {},
        disease_input: {
            type: String,
        },
        resDisease_input: {},
        conf_inp: {
            type: String,
        },
        resConf_inp: {},
        num_days: {
            type: String,
        },
        resNum_days: {},
        inp: {
            type: String,
        },
        resInp: {},
    },
    {
        // Enable timestamps to automatically add createdAt and updatedAt fields
        timestamps: true,
        // Configure JSON serialization to include virtual properties
        toJSON: { virtuals: true },
        // Configure object serialization to include virtual properties
        toObject: { virtuals: true },
    }
);

// Validation function using Joi
export const validateChatbot = function (obj) {
    const schema = Joi.object({
        welcome: Joi.object().optional(),
        disease_input: Joi.string().optional(),
        resDisease_input: Joi.object().optional(),
        conf_inp: Joi.string().optional(),
        resConf_inp: Joi.object().optional(),
        num_days: Joi.string().optional(),
        resNum_days: Joi.object().optional(),
        inp: Joi.string().optional(),
        resInp: Joi.object().optional(),
    });
    return schema.validate(obj);
};

// Create a Mongoose model based on the Chatbot schema
export default model("Chatbot", ChatbotSchema);
