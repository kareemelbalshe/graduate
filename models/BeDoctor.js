import { Schema, model } from 'mongoose';

const BeDoctorSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    email: {
        type: String,
        required: true,
    },
}, {
    // Enable timestamps to automatically add createdAt and updatedAt fields
    timestamps: true,
    // Configure JSON serialization to include virtual properties
    toJSON: { virtuals: true },
    // Configure object serialization to include virtual properties
    toObject: { virtuals: true }
}
);

export default model('BeDoctor', BeDoctorSchema);