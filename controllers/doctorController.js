import Doctor from "../models/Doctor.js"
import User from "../models/User.js"
import asyncHandler from "express-async-handler"


export const getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await User.find({ role: 'doctor' }).select("-password")
    res.status(200).json(doctors)
})

export const updateDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOneAndUpdate({ user: req.params.id }, {
        $set: {
            specialization: req.body.specialization,
            bio: req.body.bio,
            degree: req.body.degree,
            ticketPrice: req.body.ticketPrice,
            experiences: req.body.experiences,
            hospital: req.body.hospital
        },
        $push: {
            timeSlots: req.body.timeSlots
        }
    })
    res.status(201).json({ message: "Doctor is updated", doctor })
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
            $set: {
                isLike: false
            },
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
            $set: {
                isLike: true
            },
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
    const likeList=await User.findById({_id: { $in: users }}).select("-password")

    res.status(200).json(likeList)
})

export const getWishList = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    const doctors = user.wishlist
    const wishList=await User.findById({_id: { $in: doctors }}).select("-password")
    res.status(200).json(wishList)
})

export const getChatList = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    const chat = user.ChatList
    const ChatList=await User.findById({_id: { $in: chat }}).select("-password")
    res.status(200).json(ChatList)
})

export const searchPatient = asyncHandler(async (req, res) => {
    const doctor = await User.find({
        role: { $eq: "doctor" }, username: {
            $regex: req.query.keyword,
            $options: "i",
        }
    })
    res.status(200).json(doctor)
})

export const getDoctor = asyncHandler(async (req, res) => {
    const { specialization, degree } = req.query

    let doctor

    if (specialization && degree) {
        doctor = await Doctor.find({ specialization: specialization, degree: degree })
            .sort({ totalRating: -1 })
            .populate("user", ["-password"])
    }
    else if (specialization) {
        doctor = await Doctor.find({ specialization: specialization })
            .sort({ totalRating: -1 })
            .populate("user", ["-password"])
    }
    else {
        doctor = await Doctor.find({ $lte: { ticketPrice: req?.body.price } })
            .sort({ totalRating: -1 })
            .populate("user", ["-password"])
    }
    res.status(200).json(doctor)
})