import { Schema, model } from 'mongoose';


const History = new Schema({
    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
        maxlength: 200,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: "Not at app"
    },
    date: {
        type: Date,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ["t7alel", "rojeta", "ashe3a"],
    },
    image: {
        type: Object,
        default: {
            url: "",
            publicId: null,
        }
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

export default model('History', History)