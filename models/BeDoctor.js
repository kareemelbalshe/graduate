import { Schema, model } from 'mongoose';

const BeDoctorSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    image: {
        type: Object,
        required: true,
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
}
);

export default model('BeDoctor', BeDoctorSchema);