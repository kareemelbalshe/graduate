import Doctor from "../models/Doctor.js"; // Importing the Doctor model
import Review from "../models/Review.js"; // Importing the Review model
import asyncHandler from "express-async-handler"; // Importing asyncHandler middleware

// Controller to get all reviews
export const getAllReviews = asyncHandler(async (req, res) => {
    try {
        // Find all reviews and populate user and doctor fields
        const reviews = await Review.find().populate("user", "-password -wishlist -ChatList -Reservations")
            .populate("doctor", "-password -wishlist -ChatList -Reservations");

        // Respond with success message and data
        res.status(200).json({ success: true, message: "successful" }, reviews)
    } catch (error) {
        // Handle error response
        res.status(404).json({ success: false, message: "Not found", data: error.message });
    }
});

// Controller to get reviews of a specific doctor
export const getDoctorReviews = asyncHandler(async (req, res) => {
    // Find reviews for the doctor specified in the request
    const reviews = await Review.find({ doctor: req.user.id }).populate("user", "-password -wishlist -ChatList -Reservations");
    // Respond with success message and data
    res.status(200).json({ success: true, message: "successful" }, reviews)
});

// Controller to create a new review
export const createReview = asyncHandler(async (req, res) => {
    const id = req.params.id;
    // Check if the user has already reviewed the doctor
    const reviews = await Review.find({ doctor: id, user: req.user.id });
    if (!reviews) {
        // If not, create a new review
        const newReview = new Review({
            user: req.user.id,
            doctor: id,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        });
        // Save the new review
        const savedReview = await newReview.save();
        // Update doctor's total and average rating
        const stats = await Review.find({ doctor: id });
        let avg = 0;
        stats.map((v) => {
            avg += v.rating;
        });
        avg /= stats.length;
        await Doctor.findOneAndUpdate({ user: id }, {
            $push: { reviews: savedReview._id },
            totalRating: stats.length,
            averageRating: avg
        });
        // Respond with success message and data
        res.status(200).json({ success: true, message: "Review submitted" }, savedReview)
    } else {
        // If user has already reviewed, respond with error message
        res.status(500).json({ success: false, message: "you already reviewed" });
    }
});

// Controller to update a review
export const updateReviewCtrl = asyncHandler(async (req, res) => {
    const id = req.params.id;
    // Find the review by ID
    const review = await Review.findById(req.body.reviewId);
    if (!review) {
        // If review not found, respond with error message
        return res.status(404).json({ message: "review not found" });
    }
    // Update the review with new data
    const updateReview = await Review.findByIdAndUpdate(req.params.reviewId, {
        $set: {
            rating: req.body.rating,
            reviewText: req.body.reviewText
        }
    }, { new: true });
    // Recalculate and update doctor's total and average rating
    const stats = await Review.find({ doctor: id });
    let avg = 0;
    stats.map((v) => {
        avg += v.rating;
    });
    avg /= stats.length;
    await Doctor.findOneAndUpdate({ user: id }, {
        $push: { reviews: savedReview._id },
        totalRating: stats.length,
        averageRating: avg
    });
    // Respond with success message and updated review data
    res.status(201).json(updateReview);
});

// Controller to delete a review
export const deleteReview = asyncHandler(async (req, res) => {
    const id = req.params.id;
    // Remove the review from doctor's reviews array
    await Doctor.findOneAndUpdate({ user: req.params.id }, {
        $pull: {
            reviews: req.params.reviewId
        }
    });
    // Delete the review
    await Review.findOneAndRemove(req.params.reviewId);
    // Recalculate and update doctor's total and average rating
    const stats = await Review.find({ doctor: id });
    let avg = 0;
    stats.map((v) => {
        avg += v.rating;
    });
    avg /= stats.length;
    await Doctor.findOneAndUpdate({ user: id }, {
        $push: { reviews: savedReview._id },
        totalRating: stats.length,
        averageRating: avg
    });
    // Respond with success message
    res.status(200).json({ success: true, message: "Review deleted" });
});
