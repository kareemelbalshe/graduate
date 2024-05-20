import asyncHandler from "express-async-handler"; // Importing asyncHandler middleware
import User from "../models/User.js"; // Importing the User model
import bcrypt from 'bcryptjs'; // Importing bcrypt for password hashing
import path from 'path'; // Importing path module for file paths
import { fileURLToPath } from 'url'; // Importing fileURLToPath function
const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Getting current directory name
import fs from "fs"; // Importing fs module for file system operations
import { cloudinaryRemoveImage, cloudinaryRemoveMultipleImage, cloudinaryUploadImage } from "../utils/cloudinary.js"; // Importing cloudinary functions
import Doctor from "../models/Doctor.js"; // Importing the Doctor model
import Review from "../models/Review.js"; // Importing the Review model
import History from "../models/History.js"; // Importing the History model
import Report from "../models/report.js"; // Importing the Report model
import Message from "../models/Message.js"; // Importing the Message model
import Location from "../models/location.js"; // Importing the Location model

// Controller to get all users with role 'patient'
export const getAllUsersCtrl = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'patient' }).select("-password -wishlist -ChatList -Reservations");
    res.status(200).json(users);
});

// Controller to get user profile by ID
export const getUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password -wishlist -ChatList -Reservations").populate("history").populate("doctors");
    if (!user) {
        return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
});

// Controller to update user profile by ID
export const updateUserProfileCtrl = asyncHandler(async (req, res) => {
    // Hash password if provided
    if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    // Update user profile
    const updateUser = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            username: req.body.username,
            password: req.body.password,
            address: req.body.address,
            gender: req.body.gender,
            bloodType: req.body.bloodType,
            phone: req.body.phone,
        }
    }, { new: true }).select("-password -wishlist -ChatList -Reservations").populate("history").populate("doctors", "-likes");
    res.status(200).json({ message: "user info updated", updateUser });
});

// Controller to upload user profile photo
export const profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "no file provided" });
    }
    // Upload photo to cloudinary
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);
    // Update user profile photo
    const user = await User.findById(req.user.id);
    if (user.photo.publicId !== null) {
        await cloudinaryRemoveImage(user.photo.publicId);
    }
    user.photo = {
        url: result.secure_url,
        publicId: result.public_id
    };
    await user.save();
    // Remove temporary image file
    fs.unlinkSync(imagePath);
    // Respond with success message and uploaded photo data
    res.status(200).json({
        message: "your profile photo uploaded successfully",
        photo: {
            url: result.secure_url,
            publicId: result.public_id
        }
    });
});

// Controller to delete user profile
export const deleteUserProfileCtrl = asyncHandler(async (req, res) => {
    // Find user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: "user not found" });
    }
    // Find user-related data (history, reviews, doctors, messages, locations, reports) and delete them
    const history = await History.find({ user: user.id });
    const publicIds = history?.map((h) => h.image.publicId);
    if (publicIds?.length > 0) {
        await cloudinaryRemoveMultipleImage(publicIds);
    }
    if (user.photo.publicId !== null) {
        await cloudinaryRemoveImage(user.photo.publicId);
    }
    await Review.deleteMany({ user: user._id });
    await Doctor.deleteMany({ user: user._id });
    await History.deleteMany({ user: user._id });
    await Message.deleteMany({ senderId: user._id });
    await Message.deleteMany({ receiverId: user._id });
    await Location.deleteMany({ userId: user._id });
    await Report.deleteMany({ userId: user._id });
    // Delete user
    await User.findByIdAndDelete(req.params.id);
    // Respond with success message
    res.status(200).json({ message: "your profile has been deleted" });
});

// Controller to convert user to doctor
export const UserBeDoctor = asyncHandler(async (req, res) => {
    // Find user by ID
    let user = await User.findById(req.params.id);
    if (user.role === "doctor") {
        res.status(500).json({ message: "user is already doctor" });
    }
    // Update user role to doctor
    user = await User.findByIdAndUpdate(req.params.id, {
        $set: {
            role: "doctor"
        }
    });
    // Generate authentication token
    const token = user.generateAuthToken();
    // Create doctor profile for the user
    const doctor = await Doctor.create({ user: req.params.id });
    // Respond with success message and user data
    res.status(200).json({
        photo: user.photo,
        token,
        username: user.username,
        _id: user._id,
        role: user.role,
        doctor
    });
});

// Controller to block/unblock user
export const makeBlock = asyncHandler(async (req, res) => {
    // Find user by ID
    const user = await User.findById(req.params.id);
    // Toggle user's block status
    if (user.isBlocked === false) {
        user.isBlocked = true;
        user.save();
        res.status(201).json({ message: "user blocked" });
    } else {
        user.isBlocked = false;
        user.save();
        res.status(201).json({ message: "user unblocked" });
    }
});

// Controller to create a report
export const createReport = asyncHandler(async (req, res) => {
    // Create a report
    const report = await Report.create({
        user: req.user.id,
        about: req.params.id,
        description: req.body.description,
        kind: req.query.kind
    });
    // Respond with success message and report data
    res.status(200).json(report);
});

// Controller to get all reports
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
                .populate("doctor", "-password -wishlist -ChatList -Reservations");
        } else if (kind === "review") {
            response = await Review.findById(v.about).populate("user", "-password -wishlist -ChatList -Reservations")
                .populate("doctor", "-password -wishlist -ChatList -Reservations");
        }

        resp.push({ response, description: v.description });
    }));

    res.status(200).json({ data: resp });
});


export const deleteReport = asyncHandler(async (req, res) => {
    await Report.findByIdAndDelete(req.params.reportId)

    res.status(200).json({ message: "report deleted" })
})
