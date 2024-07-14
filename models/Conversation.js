import mongoose from 'mongoose';

// Define a schema for conversations
const conversationSchema = new mongoose.Schema(
    {
        // Define an array of participants in the conversation
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // Reference to the User model
                required: true
            },
        ],
        // Define an array of messages in the conversation
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Message", // Reference to the Message model
                default: [], // Default value is an empty array
            },
        ],
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

// Create a Mongoose model based on the conversation schema
const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
