import Doctor from "../models/Doctor.js"
import User from "../models/User.js"
import asyncHandler from "express-async-handler"


export const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await User.find({ role: 'doctor' }).populate("doctors").select("-password")
    res.status(200).json(doctors)
})

export const updateDoctor = asyncHandler(async (req, res) => {
    await Doctor.findOneAndUpdate({ user: req.params.id }, {
        $set: {
            specialization: req.body.specialization,
            bio: req.body.bio,
            degree: req.body.degree,
            ticketPrice: req.body.ticketPrice,
            experiences: req.body.experiences,
            hospital: req.body.hospital
        },
    })
    const user = await User.findById(req.params.id).select("-password -wishlist -ChatList -Reservations").populate("doctors", "-likes")
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }
    res.status(201).json({ message: "Doctor is updated", user })
})

export const toggleLikeCtrl = asyncHandler(async (req, res) => {
    const loginUser = req.user.id

    console.log()

    let doctor = await Doctor.findOne({ user: req.params.id })
    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" })
    }
    const isDoctorAlreadyLiked = doctor.likes.find((user) => user.toString() === loginUser)
    if (isDoctorAlreadyLiked) {
        await Doctor.findOneAndUpdate({ user: req.params.id }, {
            $pull: {
                likes: loginUser
            }
        }, { new: true })
        await User.findByIdAndUpdate(loginUser, {
            $pull: {
                wishlist: req.params.id
            }
        })
        res.status(200).json({ success: false })
    }
    else {
        await Doctor.findOneAndUpdate({ user: req.params.id }, {
            $push: {
                likes: loginUser
            }
        }, { new: true })
        await User.findByIdAndUpdate(loginUser, {
            $push: {
                wishlist: req.params.id
            }
        })
        res.status(200).json({ success: true })
    }
})

export const getLikeList = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ user: req.params.id })

    const users = doctor.likes
    const likeList = await User.find({ _id: { $in: users } }).select("-password").select("-wishlist").select("-ChatList")

    res.status(200).json(likeList)
})

export const getWishList = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    const doctors = user.wishlist
    const wishList = await User.find({ _id: { $in: doctors } }).select("-password").select("-likes").select("-ChatList")
    res.status(200).json(wishList)
})

export const getChatList = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    const chat = user.ChatList
    const ChatList = await User.find({ _id: { $in: chat } }).select("-password").select("-likes").select("-wishlist")
    res.status(200).json(ChatList)
})


export const searchAboutPatient = asyncHandler(async (req, res) => {
    let patient
    const username = req.body.username,
        id = req.body.id
    if (username) {
        patient = await User.find({
            role: "patient",
            username: {
                $regex: username,
                $options: "i",
            }
        }).select("-password -wishlist -ChatList -Reservations").populate("doctors", "-likes -reviews")
    }
    else if (id) {
        patient = await User.find({
            role: "patient", _id: req?.body.id,
        }).select("-password -wishlist -ChatList -Reservations").populate("doctors", "-likes -reviews")
    }
    res.status(200).json(patient)
})

export const searchAboutDoctor = asyncHandler(async (req, res) => {
    let doctor
    const username = req.body.username,
        id = req.body.id
    if (username) {
        doctor = await User.find({
            role: "doctor",
            username: {
                $regex: username,
                $options: "i",
            }
        }).select("-password -wishlist -ChatList -Reservations").populate("doctors", "-likes -reviews")
    }
    else if (id) {
        doctor = await User.find({
            role: "doctor", _id: req?.body.id,
        }).select("-password -wishlist -ChatList -Reservations").populate("doctors", "-likes -reviews")
    }
    res.status(200).json(doctor)
})

export const popularDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.find().select("-reviews").populate("user", "-password -wishlist -ChatList -Reservations").sort({ totalRating: -1, averageRating: -1, likes: -1 }).limit(20)
    res.status(200).json(doctor)
})

export const newDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.find().select("-likes -reviews").populate("user", "-password -wishlist -ChatList -Reservations").sort({ createdAt: -1 }).limit(20)
    res.status(200).json(doctor)
})

export const getDoctor = asyncHandler(async (req, res) => {
    const { specialization, degree, ticketPrice } = req.query
    const username = req.body.username

    let doctor

    if (specialization && degree && ticketPrice && username) {
        const d = await User.find({
            username: {
                $regex: username,
                $options: "i",
            }
        })
        const id = d.map((u) => {
            return u._id
        })
        doctor = await Doctor.find({
            specialization: specialization, degree: degree, ticketPrice: { $lte: ticketPrice }, user: { _id: id }
        })
            .sort({ totalRating: -1, averageRating: -1, likes: -1 })
            .populate("user", "-password -wishlist -ChatList -Reservations").select("-reviews")
    }
    else if (specialization && degree && ticketPrice) {
        doctor = await Doctor.find({
            specialization: specialization, degree: degree, ticketPrice: { $lte: ticketPrice }
        })
            .sort({ totalRating: -1, averageRating: -1, likes: -1 })
            .populate("user", "-password -wishlist -ChatList -Reservations").select("-reviews")
    }
    else if (specialization && degree) {
        doctor = await Doctor.find({
            specialization: specialization, degree: degree,
        })
            .sort({ totalRating: -1, averageRating: -1, likes: -1 })
            .populate("user", "-password -wishlist -ChatList -Reservations").select("-reviews")
    }
    else if (specialization) {
        doctor = await Doctor.find({
            specialization: specialization,
        })
            .sort({ totalRating: -1, averageRating: -1, likes: -1 })
            .populate("user", "-password -wishlist -ChatList -Reservations").select("-reviews")
    }


    res.status(200).json(doctor)
})