import asyncHandler from "express-async-handler"; // Importing asyncHandler middleware
import User, { validateUpdateUser } from "../models/User.js"; // Importing the User model
import bcrypt from 'bcryptjs'; // Importing bcrypt for password hashing
import path from 'path'; // Importing path module for file paths
import { fileURLToPath } from 'url'; // Importing fileURLToPath function
const __dirname = path.dirname(fileURLToPath(import.meta.url)); // Getting current directory name
import fs from "fs"; // Importing fs module for file system operations
import { cloudinaryRemoveImage, cloudinaryRemoveMultipleImage, cloudinaryUploadImage } from "../utils/cloudinary.js"; // Importing cloudinary functions
import Doctor, { validateDoctor } from "../models/Doctor.js"; // Importing the Doctor model
import Review from "../models/Review.js"; // Importing the Review model
import History from "../models/History.js"; // Importing the History model
import Report, { validateReport } from "../models/Report.js"; // Importing the Report model
import Message from "../models/Message.js"; // Importing the Message model
import Location from "../models/Location.js"; // Importing the Location model
import BeDoctor, { validateBeDoctor } from "../models/BeDoctor.js";
import cron from 'node-cron';


// Controller to get all users with role 'patient'
export const getAllUsersCtrl = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'patient' }).select("-password -wishlist -ChatList -Reservations");
    if (users.length === 0) {
        return res.status(400).json({ message: "No users found" });
    }
    res.status(200).json(users);
});

// Controller to get user profile by ID
export const getUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password -wishlist -ChatList -Reservations").populate("history").populate("doctors location");
    if (!user) {
        return res.status(404).json({ message: "user not found" });
    }
    res.status(200).json(user);
});

// Controller to update user profile by ID
export const updateUserProfileCtrl = asyncHandler(async (req, res) => {
    const { error } = validateUpdateUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
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

    // Respond with success message and uploaded photo data
    res.status(200).json({
        message: "your profile photo uploaded successfully",
        photo: {
            url: result.secure_url,
            publicId: result.public_id
        }
    });
    // Remove temporary image file
    fs.unlinkSync(imagePath);
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

export const askToBeDoctor = asyncHandler(async (req, res) => {
    const { error } = validateBeDoctor(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    // Find user by ID
    let user = await User.findById(req.user.id);
    if (user.role === "doctor") {
        res.status(500).json({ message: "user is already doctor" });
    }

    await BeDoctor.create({
        userId: req.user.id,
        email: req.body.email,
    })

    res.status(200).json({ message: "we sent your application to be a doctor" })
});

export const getApplications = asyncHandler(async (req, res) => {
    const applications = await BeDoctor.find().populate("userId", "-password -wishlist -ChatList -Reservations").sort({ createdAt: -1 })
    if (applications.length === 0) {
        return res.status(404).json({ message: "no applications found" });
    }
    res.status(200).json(applications)
});

// Controller to convert user to doctor
export const UserBeDoctor = asyncHandler(async (req, res) => {
    const { error } = validateDoctor(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    // Find user by ID
    let user = await User.findById(req.params.id);
    if (user.role === "doctor") {
        user = await User.findByIdAndUpdate(req.params.id, {
            $set: {
                role: "patient"
            }
        });
        // Generate authentication token
        const token = user.generateAuthToken();
        // Create doctor profile for the user
        await Doctor.findOneAndDelete({ user: req.params.id });
        // Respond with success message and user data
        res.status(200).json({
            photo: user.photo,
            token,
            username: user.username,
            _id: user._id,
            role: user.role,
        });
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
    const doctor = await Doctor.create({ user: req.params.id, specialization: req.body.specialization });
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
    if (!user) {
        return res.status(404).json({ message: "user not found" });
    }
    // Toggle user's block status
    if (user.isBlocked === false) {
        user.isBlocked = true;
        await user.save();
        res.status(201).json({ message: "user blocked" });
    } else {
        user.isBlocked = false;
        await user.save();
        res.status(201).json({ message: "user unblocked" });
    }
});

// Controller to create a report
export const createReport = asyncHandler(async (req, res) => {
    const { error } = validateReport(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
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
const getResponseByKind = async (kind, id) => {
    let response;

    switch (kind) {
        case "user":
            response = await User.findById(id)
                .select('-password -wishlist -ChatList -Reservations')
            break;
        case "message":
            response = await Message.findById(id)
                .populate({ path: 'senderId', select: '-password -wishlist -ChatList -Reservations' })
                .populate({ path: 'receiverId', select: '-password -wishlist -ChatList -Reservations' })
            break;
        case "history":
            response = await History.findById(id)
                .populate({ path: 'user', select: '-password -wishlist -ChatList -Reservations' })
            break;
        case "review":
            response = await Review.findById(id)
                .populate({ path: 'user', select: '-password -wishlist -ChatList -Reservations' })
            break;
        default:
            response = null;
    }

    return response;
};

export const getAllReports = asyncHandler(async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });
        let resp = [];

        await Promise.all(reports.map(async (v) => {
            const response = await getResponseByKind(v.kind, v.about);
            if (response) {
                resp.push({ response, description: v.description, kind: v.kind, createdAt: v.createdAt });
            }
        }));
        resp = resp.sort((a, b) => b.createdAt - a.createdAt);

        if (resp.length === 0) {
            return res.status(404).json({ message: "No reports found" });
        }

        res.status(200).json({ data: resp });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export const deleteReport = asyncHandler(async (req, res) => {
    const report = await Report.findByIdAndDelete(req.params.reportId)
    if (!report) {
        return res.status(404).json({ message: "no report found" });
    }
    res.status(200).json({ message: "report deleted" })
})

cron.schedule('0 0 * * *', async () => {
    try {
        // Calculate the date one week ago from now
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Delete Report older than one week
        const result = await Report.deleteMany({ createdAt: { $lt: oneWeekAgo } });

        console.log(`Deleted ${result.deletedCount} outdated Report.`);
    } catch (error) {
        console.error('Error deleting outdated Report:', error);
    }
});