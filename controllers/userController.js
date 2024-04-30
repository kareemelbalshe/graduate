import asyncHandler from "express-async-handler"
import User from "../models/User.js"
import bcrypt from 'bcryptjs'
import path from 'path'
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import fs from "fs"
import { cloudinaryRemoveImage, cloudinaryRemoveMultipleImage, cloudinaryUploadImage } from "../utils/cloudinary.js"
import Doctor from "../models/Doctor.js";
import Review from "../models/Review.js";
import History from "../models/History.js";
import Report from "../models/report.js"
import Message from "../models/Message.js";
import Location from "../models/location.js";


export const getAllUsersCtrl = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'patient' }).select("-password -wishlist -ChatList -Reservations")
    res.status(200).json(users)
})

export const getUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password -wishlist -ChatList -Reservations").populate("history").populate("doctors")
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }
    res.status(200).json(user)
})

export const updateUserProfileCtrl = asyncHandler(async (req, res) => {
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
            phone: req.body.phone,
        }
    }, { new: true }).select("-password -wishlist -ChatList -Reservations").populate("history").populate("doctors", "-likes")
    res.status(200).json(updateUser)
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
    await Message.deleteMany({ senderId: user._id })
    await Message.deleteMany({ receiverId: user._id })
    await Location.deleteMany({ userId: user._id })
    await Report.deleteMany({ userId: user._id })

    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: "your profile has been deleted" })
})

export const UserBeDoctor = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            role: 'doctor'
        }
    })
    const token = user.generateAuthToken()
    const doctor = await Doctor.create({ user: req.params.id })
    res.status(200).json({
        _id: user._id,
        role: user.role,
        photo: user.photo,
        token,
        username: user.username,
        doctor
    })
})

export const makeBlock = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.body.id, {
        $set: {
            isBlocked: true
        }
    })
    res.status(201).json(user)
})

export const createReport = asyncHandler(async (req, res) => {
    const report = await Report.create({
        user: req.user.id,
        description: req.body.description,
        about: req.params.id,
        kind: req.query.kind
    })
    res.status(200).json(report)
})

export const getAllReports = asyncHandler(async (req, res) => {
    const report = await Report.find();
    let resp = [];

    await Promise.all(report.map(async (v) => {
        let kind = v.kind;
        let response;

        if (kind === "user") {
            response = await User.findById(v.about).populate("-password -wishlist -ChatList -Reservations");
        } else if (kind === "message") {
            response = await Message.findById(v.about).populate("senderId", "-password -wishlist -ChatList -Reservations")
                .populate("receiverId", "-password -wishlist -ChatList -Reservations");
        } else if (kind === "history") {
            response = await History.findById(v.about).populate("user", "-password -wishlist -ChatList -Reservations")
                .populate("doctor", "-likes -reviews -booking");
        } else if (kind === "review") {
            response = await Review.findById(v.about).populate("user", "-password -wishlist -ChatList -Reservations")
                .populate("doctor", "-likes -reviews -booking");
        }

        resp.push({ response, description: v.description });
    }));

    res.status(200).json({ data: resp });
});


export const deleteReport = asyncHandler(async (req, res) => {
    await Report.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: "report deleted" })
})
