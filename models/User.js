import { Schema, model } from 'mongoose';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';

const User = new Schema({
    googleId:String,
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
    phone: {
        type: String,
    },
    Reservations: {
        type: Array,
        default: [],
    },
    photo: {
        type: Object,
        default: {
            url: "https://cdn.pixabay.com/photo/2016/09/28/02/14/user-1699635_640.png",
            publicId: null,
        }
    },
    address: {
        type: String,
    },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "User" }],
    ChatList: [{ type: Schema.Types.ObjectId, ref: "User" }],
    role: {
        type: String,
        enum: ["patient", "admin","doctor"],
        default: "patient",
    },
    gender: { type: String, enum: ["male", "female", "other"] },
    bloodType: { type: String },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

User.virtual("doctors", {
    ref: "Doctor",
    foreignField: "doctor",
    localField: "_id"
})

User.virtual("reviews", {
    ref: "Review",
    foreignField: "review",
    localField: "_id"
})

User.virtual("history", {
    ref: "History",
    foreignField: "history",
    localField: "_id"
})

User.methods.generateAuthToken = function () {
    return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET)
}


export const validateRegisterUser = function (obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: passwordComplexity().required()
    })
    return schema.validate(obj)
}

export const validateLoginUser = function (obj) {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(8).required(),
    })
    return schema.validate(obj)
}

export const validateUpdateUser = function (obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100),
        password: passwordComplexity(),
    })
    return schema.validate(obj)
}

export const validateEmail = function (obj) {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
    })
    return schema.validate(obj)
}

export const validateNewPassword = function (obj) {
    const schema = Joi.object({
        password: passwordComplexity().required(),
    })
    return schema.validate(obj)
}

export default model('User', User)