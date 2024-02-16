import { Schema, model } from 'mongoose';
import Joi from 'joi';


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
        ref: "Doctor",
    },
    date:{
        type:Date
    },
    category: {
        type: String,
        required: true,
        enum: ["t7alel", "rojeta","ashe3a"],
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