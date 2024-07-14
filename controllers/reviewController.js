import Doctor from "../models/Doctor.js"; // Importing the Doctor model
import Review, { validateReview } from "../models/Review.js"; // Importing the Review model
import asyncHandler from "express-async-handler"; // Importing asyncHandler middleware

// Controller to get all reviews
export const getAllReviews = asyncHandler(async (req, res) => {
    try {
        // Find all reviews and populate user and doctor fields
        const reviews = await Review.find().populate("user", "-password -wishlist -ChatList -Reservations")
            .populate("doctor", "-password -wishlist -ChatList -Reservations").sort({ createdAt: -1 });

        // Respond with success message and data
        res.status(200).json({ success: true, message: "successful", data: reviews });
    } catch (error) {
        // Handle error response
        res.status(404).json({ success: false, message: "Not found", data: error.message });
    }
});

// Controller to get reviews of a specific doctor
export const getDoctorReviews = asyncHandler(async (req, res) => {
    // Find reviews for the doctor specified in the request
    const reviews = await Review.find({ doctor: req.user.id }).populate("user", "-password -wishlist -ChatList -Reservations").sort({ createdAt: -1 });
    // Respond with success message and data
    res.status(200).json({ success: true, message: "successful", data: reviews });
});

// Controller to create a new review
export const createReview = asyncHandler(async (req, res) => {
    try {
        const { error } = validateReview(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const id = req.params.id;
        // Check if the user has already reviewed the doctor
        const existingReview = await Review.findOne({ doctor: id, user: req.user.id });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "You have already reviewed this doctor" });
        }

        // Create a new review
        const newReview = new Review({
            user: req.user.id,
            doctor: id,
            rating: req.body.rating,
            reviewText: req.body.reviewText
        });

        // Save the new review
        const savedReview = await newReview.save();

        // Calculate the new average rating and total number of reviews
        const stats = await Review.aggregate([
            { $match: { doctor: id } },
            { $group: { _id: "$doctor", avgRating: { $avg: "$rating" }, totalRatings: { $sum: 1 } } }
        ]);

        if (stats.length > 0) {
            await Doctor.updateOne(
                { _id: id },
                {
                    $push: { reviews: savedReview._id },
                    totalRating: stats[0].totalRatings,
                    averageRating: stats[0].avgRating
                }
            );
        }

        // Respond with success message and data
        res.status(200).json({ success: true, message: "Review submitted", data: savedReview });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Controller to update a review
export const updateReviewCtrl = asyncHandler(async (req, res) => {
    try {
        const { error } = validateReview(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }
        const doctorId = req.params.id;
        const reviewId = req.params.reviewId;

        // Find the review by ID
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: "Review not found" });
        }

        if (review.user.toString() !== req.user.id) {
            return res.status(400).json({ message: "You are not authorized to update this review" });
        }

        // Check if the review belongs to the doctor
        if (review.doctor.toString() !== doctorId) {
            return res.status(400).json({ message: "Review does not belong to this doctor" });
        }

        // Update the review with new data
        const updatedReview = await Review.findByIdAndUpdate(reviewId, {
            $set: {
                rating: req.body.rating,
                reviewText: req.body.reviewText
            }
        }, { new: true });

        // Recalculate and update doctor's total and average rating
        const stats = await Review.aggregate([
            { $match: { doctor: doctorId } },
            { $group: { _id: "$doctor", avgRating: { $avg: "$rating" }, totalRatings: { $sum: 1 } } }
        ]);

        if (stats.length > 0) {
            await Doctor.updateOne(
                { _id: doctorId },
                {
                    totalRating: stats[0].totalRatings,
                    averageRating: stats[0].avgRating
                }
            );
        }

        // Respond with success message and updated review data
        res.status(201).json({ success: true, message: "Review updated", data: updatedReview });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// Controller to delete a review
export const deleteReview = asyncHandler(async (req, res) => {
    try {
        const doctorId = req.params.id;
        const reviewId = req.params.reviewId;

        // Check if the review exists
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found" });
        }

        // Remove the review from doctor's reviews array
        await Doctor.findOneAndUpdate({ _id: doctorId }, {
            $pull: { reviews: reviewId }
        });

        // Delete the review
        await Review.findByIdAndRemove(reviewId);

        // Recalculate and update doctor's total and average rating
        const stats = await Review.aggregate([
            { $match: { doctor: doctorId } },
            { $group: { _id: "$doctor", avgRating: { $avg: "$rating" }, totalRatings: { $sum: 1 } } }
        ]);

        if (stats.length > 0) {
            await Doctor.updateOne(
                { _id: doctorId },
                {
                    totalRating: stats[0].totalRatings,
                    averageRating: stats[0].avgRating
                }
            );
        } else {
            // If no reviews are left, reset the total and average ratings
            await Doctor.updateOne(
                { _id: doctorId },
                {
                    totalRating: 0,
                    averageRating: 0
                }
            );
        }

        // Respond with success message
        res.status(200).json({ success: true, message: "Review deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

