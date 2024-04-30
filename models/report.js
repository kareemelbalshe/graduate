import { Schema, model } from 'mongoose';

const Report = new Schema({
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
    about: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    kind: {
        type: String,
        enum: ["user", "message", "review", "history"],
        required: true,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

export default model('Report', Report)