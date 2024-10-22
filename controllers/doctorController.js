// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com

import Conversation from "../models/Conversation.js";
import Doctor, { validateDoctor } from "../models/Doctor.js";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";

// Endpoint to get all doctors
export const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await User.find({ role: 'doctor' })
        .populate("doctors", "-likes")
        .select("-password -wishlist -ChatList -Reservations")
        .sort({ createdAt: -1 });

    if (doctors.length === 0) {
        return res.status(404).json({ message: "No doctors found" });
    }
    res.status(200).json(doctors);
});

// Endpoint to update doctor information
export const updateDoctor = asyncHandler(async (req, res) => {
    const { error } = validateDoctor(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    await Doctor.findOneAndUpdate({ user: req.params.id }, {
        $set: {
            specialization: req.body.specialization,
            bio: req.body.bio,
            degree: req.body.degree,
            ticketPriceClinic: req.body.ticketPriceClinic,
            ticketPriceHome: req.body.ticketPriceHome,
            experiences: req.body.experiences,
            hospital: req.body.hospital
        },
    });

    const user = await User.findById(req.params.id)
        .select("-password -wishlist -ChatList -Reservations")
        .populate("doctors", "-likes");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(201).json({ message: "Doctor updated successfully", user });
});

// Endpoint to toggle like for a doctor
export const toggleLikeCtrl = asyncHandler(async (req, res) => {
    const loginUser = req.user.id;
    let doctor = await Doctor.findOne({ user: req.params.id });

    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }

    const isDoctorAlreadyLiked = doctor.likes.find((user) => user.toString() === loginUser);
    if (isDoctorAlreadyLiked) {
        await Doctor.findOneAndUpdate({ user: req.params.id }, {
            $pull: { likes: loginUser }
        }, { new: true });

        await User.findByIdAndUpdate(loginUser, {
            $pull: { wishlist: req.params.id }
        });

        res.status(200).json({ success: false });
    } else {
        await Doctor.findOneAndUpdate({ user: req.params.id }, {
            $push: { likes: loginUser }
        }, { new: true });

        await User.findByIdAndUpdate(loginUser, {
            $push: { wishlist: req.params.id }
        });

        res.status(200).json({ success: true });
    }
});

// Endpoint to get the list of users who liked a doctor
export const getLikeList = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ user: req.params.id });

    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
    }

    const users = doctor.likes;
    const likeList = await User.find({ _id: { $in: users } })
        .select("-password -Reservations -wishlist -ChatList");

    res.status(200).json(likeList);
});

// Endpoint to get the wishlist of a user
export const getWishList = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const doctors = user.wishlist;
    const wishList = await User.find({ _id: { $in: doctors } })
        .select("-password -Reservations -likes -ChatList");

    res.status(200).json(wishList);
});

// Endpoint to get the chat list of a user
export const getChatList = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const chat = user.ChatList;
    const chatList = await Conversation.find({ _id: { $in: chat } })
        .populate("participants", "-password -wishlist -ChatList -Reservations")
        .sort({ updatedAt: -1 });

    res.status(200).json(chatList);
});

// Endpoint to search for patients
export const searchAboutPatient = asyncHandler(async (req, res) => {
    let patient;
    const { username, email, id } = req.body;

    if (username) {
        patient = await User.find({
            role: "patient",
            username: { $regex: username, $options: "i" }
        }).select("-password -wishlist -ChatList -Reservations");
    } else if (id) {
        patient = await User.findOne({
            role: "patient", _id: id
        }).select("-password -wishlist -ChatList -Reservations");
    } else if (email) {
        patient = await User.findOne({
            role: "patient", email
        }).select("-password -wishlist -ChatList -Reservations");
    }
    res.status(200).json(patient);
});

// Endpoint to search for doctors
export const searchAboutDoctor = asyncHandler(async (req, res) => {
    let doctor;
    const { username, id } = req.body;

    if (username) {
        doctor = await User.find({
            role: "doctor",
            username: { $regex: username, $options: "i" }
        }).select("-password -wishlist -ChatList -Reservations").populate("doctors", "-likes -reviews -booking");
    } else if (id) {
        doctor = await User.find({
            role: "doctor", _id: id
        }).select("-password -wishlist -ChatList -Reservations").populate("doctors", "-likes -reviews");
    }
    res.status(200).json(doctor);
});

// Endpoint to get popular doctors based on specialization
export const popularDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.find({ specialization: req.query.specialization })
        .select("-reviews")
        .populate("user", "-password -wishlist -ChatList -Reservations")
        .sort({ totalRating: -1, averageRating: -1, likes: -1 })
        .limit(10);

    res.status(200).json(doctor);
});

// Endpoint to get new doctors
export const newDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.find()
        .select("-likes -reviews -booking")
        .populate("user", "-password -wishlist -ChatList -Reservations")
        .sort({ createdAt: -1 })
        .limit(20);

    res.status(200).json(doctor);
});

// Endpoint to search about doctors
export const getDoctor = asyncHandler(async (req, res) => {
    const { specialization, degree, ticketPrice } = req.query;
    const { username } = req.body;

    let doctor;

    if (specialization && degree && ticketPrice && username) {
        const users = await User.find({
            username: { $regex: username, $options: "i" }
        });

        const ids = users.map((u) => u._id);

        doctor = await Doctor.find({
            specialization,
            degree,
            ticketPrice: { $lte: ticketPrice },
            user: { _id: ids }
        }).sort({ totalRating: -1, averageRating: -1, likes: -1 })
            .populate("user", "-password -wishlist -ChatList -Reservations")
            .select("-reviews");
    } else if (specialization && degree && ticketPrice) {
        doctor = await Doctor.find({
            specialization,
            degree,
            ticketPrice: { $lte: ticketPrice }
        }).sort({ totalRating: -1, averageRating: -1, likes: -1 })
            .populate("user", "-password -wishlist -ChatList -Reservations")
            .select("-reviews");
    } else if (specialization && degree) {
        doctor = await Doctor.find({
            specialization,
            degree
        }).sort({ totalRating: -1, averageRating: -1, likes: -1 })
            .populate("user", "-password -wishlist -ChatList -Reservations")
            .select("-reviews");
    } else if (specialization) {
        doctor = await Doctor.find({ specialization })
            .sort({ totalRating: -1, averageRating: -1, likes: -1 })
            .populate("user", "-password -wishlist -ChatList -Reservations")
            .select("-reviews");
    }

    res.status(200).json(doctor);
});
