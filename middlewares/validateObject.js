import mongoose from "mongoose";

// Middleware to validate MongoDB ObjectId
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
export default (req, res, next) => {
    // Check if the provided ID in request parameters is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        // If the ID is not valid, return a 400 Bad Request response with an error message
        return res.status(400).json({ message: "invalid id" });
    }
    // If the ID is valid, proceed to the next middleware or route handler
    next();
}
