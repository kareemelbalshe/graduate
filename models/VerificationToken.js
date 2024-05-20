import { Schema, model } from 'mongoose';

// Define the VerificationToken schema
const VerificationToken = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
}, { timestamps: true });

// Create a Mongoose model based on the VerificationToken schema
export default model('VerificationToken', VerificationToken);
