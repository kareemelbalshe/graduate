import Doctor from "../models/Doctor.js"
import Review from "../models/Review.js"
import asyncHandler from "express-async-handler"


export const getAllReviews = asyncHandler(async (req, res) => {
    try {
        const reviews = await Review.find().populate("user", "-password -wishlist -ChatList -Reservations")
            .populate("doctor", "-likes -reviews")

        res.status(200).json({ success: true, message: "successful", data: reviews })
    } catch (error) {
        res.status(404).json({ success: false, message: "Not found", data: error.message })
    }
})

export const getDoctorReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ doctor: req.user.id }).populate("user", "-password -wishlist -ChatList -Reservations")
    res.status(200).json({ success: true, message: "successful", data: reviews })
})

export const createReview = asyncHandler(async (req, res) => {
    const id = req.params.id
    const reviews = await Review.find({ doctor:id,user:req.user.id })
    if (!reviews) {
        const newReview = new Review({
            user: req.user.id,
            doctor: id,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        })
        const savedReview = await newReview.save()
        const stats = await Review.find({ doctor: id })
        let avg = 0
        stats.map((v) => {
            avg += v.rating
        })

        avg /= stats.length
        await Doctor.findOneAndUpdate({ user: id }, {
            $push: { reviews: savedReview._id },
            totalRating: stats.length,
            averageRating: avg
        })
        res.status(200).json({ success: true, message: "Review submitted", data: newReview })
    }
    else {
        res.status(500).json({ success: false, message: "you already reviewed" })
    }
})

export const updateReviewCtrl = asyncHandler(async (req, res) => {

    const review = await Review.findById(req.body.reviewId)
    if (!review) {
        return res.status(404).json({ message: "review not found" })
    }

    if (req.user.id !== review.user.toString()) {
        return res.status(403).json({ message: "access denied, only user himself can edit his review" })
    }

    const updateReview = await Review.findByIdAndUpdate(req.body.reviewId, {
        $set: {
            rating: req.body.rating,
            reviewText: req.body.reviewText
        }
    }, { new: true })
    const stats = await Review.find({ doctor: id })
    let avg = 0
    stats.map((v) => {
        avg += v.rating
    })

    avg /= stats.length
    await Doctor.findOneAndUpdate({ user: id }, {
        $push: { reviews: savedReview._id },
        totalRating: stats.length,
        averageRating: avg
    })

    res.status(201).json(updateReview)
})

export const deleteReview = asyncHandler(async (req, res) => {
    await Review.findOneAndRemove(req.params.reviewId)
    res.status(200).json({ success: true, message: "Review deleted" })
})