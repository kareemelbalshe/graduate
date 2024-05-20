import User from "../models/User.js"; // Import the User model

// Middleware to check if the user is blocked
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
export const isBlock = async (req, res, next) => {
    try {
        // Find the user by ID
        const user = await User.findById(req.user.id);
        // Check if the user is blocked
        if (user.isBlocked === true) {
            return res.status(400).json({ message: "You are blocked" }); // Return an error if the user is blocked
        }
        next(); // Proceed if the user is not blocked
    } catch (error) {
        console.log("Error checking user block status:", error); // Log any errors that occur
        return res.status(500).json({ message: "Internal server error" }); // Return a generic error message
    }
}
