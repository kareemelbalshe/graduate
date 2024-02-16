import { Schema, model } from 'mongoose';

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
}, { timestamps: true })

export default model('VerificationToken', VerificationToken)