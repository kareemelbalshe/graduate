import asyncHandler from "express-async-handler"
import User, { validateUpdateUser } from "../models/User.js"
import bcrypt from 'bcryptjs'
import path from 'path'
import textflow from "textflow.js"
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import fs from "fs"
import { cloudinaryRemoveImage, cloudinaryRemoveMultipleImage, cloudinaryUploadImage } from "../utils/cloudinary.js"
import Doctor from "../models/Doctor.js";
import Review from "../models/Review.js";
import History from "../models/History.js";


export const getAllUsersCtrl = asyncHandler(async (req, res) => {
    const users = await User.find({role:'patient'}).select("-password")
    res.status(200).json(users)
})

export const getUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password").populate("reviews doctors history")
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }
    res.status(200).json(user)
})

export const updateUserProfileCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdateUser(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
    }
    const updateUser = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            username: req.body.username,
            password: req.body.password,
            address: req.body.address,
            gender: req.body.gender,
            bloodType: req.body.bloodType,
        }
    }, { new: true }).select("-password").populate("reviews doctors history")
    res.status(200).json(updateUser)
})

export const getUsersCountCtrl = asyncHandler(async (req, res) => {
    const count = await User.count()
    res.status(200).json(count)
})

export const profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "no file provided" })
    }

    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)

    const user = await User.findById(req.user.id)

    if (user.photo.publicId !== null) {
        await cloudinaryRemoveImage(user.photo.publicId)
    }

    user.photo = {
        url: result.secure_url,
        publicId: result.public_id
    }

    await user.save()

    res.status(200).json({
        message: "your profile photo uploaded successfully",
        photo: {
            url: result.secure_url,
            publicId: result.public_id
        }
    })

    fs.unlinkSync(imagePath)
})

export const deleteUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)

    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }

    const history = await History.find({ user: user.id })
    const publicIds = history?.map((h) => h.image.publicId)

    if (publicIds?.length > 0) {
        await cloudinaryRemoveMultipleImage(publicIds)
    }

    if (user.photo.publicId !== null) {
        await cloudinaryRemoveImage(user.photo.publicId)
    }

    await Review.deleteMany({ user: user._id })
    await Doctor.deleteMany({ user: user._id })
    await History.deleteMany({ user: user._id })

    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: "your profile has been deleted" })
})

export const UserBeDoctor = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, {
        $set: {
            role: 'doctor'
        }
    })
    const doctor = await Doctor.create({ user: req.params.id })
    res.status(201).json(doctor)
})

export const makeBlock = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.body.id, {
        $set: {
            isBlocked: true
        }
    })
    res.status(201).json(user)
}

export const sendSMSPhone = async (req, res) => {
    const phone = req.body.phone

    var result = await textflow.sendVerificationSMS(phone);

    if (result.ok) //send sms here
        return res.status(200).json({ success: true });

    return res.status(400).json({ success: false });

}
export const setPhone = async (req, res) => {
    const phone = req.body.phone

    var result = await textflow.verifyCode(phone, req.body.code);

    if (!result.valid) {
        return res.status(400).json({ success: false });
    }

    const user = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            phone: phone
        }
    })
    res.status(201).json(user)
}