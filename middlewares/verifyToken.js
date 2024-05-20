import jwt from "jsonwebtoken";

// Middleware to verify JWT token
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
export const verifyToken = function (req, res, next) {
    const authToken = req.headers.authorization; // Get the authorization header
    if (authToken) {
        const token = authToken.split(" ")[1]; // Extract the token from the header
        try {
            const decodedPayload = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
            req.user = decodedPayload; // Attach the decoded payload to the request object
            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            return res.status(401).json({ message: "Invalid token, access denied" }); // Handle invalid token
        }
    } else {
        return res.status(401).json({ message: "No token provided, access denied" }); // Handle missing token
    }
}

// Middleware to verify if the user is a doctor
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
export const verifyDoctor = function (req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.role === 'doctor') { // Check if the user has the role of a doctor
            next(); // Proceed if the user is a doctor
        } else {
            return res.status(403).json({ message: "Not allowed, only doctor" }); // Handle unauthorized access
        }
    });
}

// Middleware to verify if the user is an admin
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
export const verifyTokenAndAdmin = function (req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') { // Check if the user has the role of an admin
            next(); // Proceed if the user is an admin
        } else {
            return res.status(403).json({ message: "Not allowed, only admin" }); // Handle unauthorized access
        }
    });
}

// Middleware to verify if the user is the same as the one in the request parameters
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
export const verifyTokenAndOnlyUser = function (req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id) { // Check if the user ID matches the ID in the request parameters
            next(); // Proceed if the user is the same
        } else {
            return res.status(403).json({ message: "Not allowed, only user himself" }); // Handle unauthorized access
        }
    });
}

// Middleware to verify if the user is the same as the one in the request parameters or an admin
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
export const verifyTokenAndAuthorization = function (req, res, next) {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.role === 'admin') { // Check if the user ID matches or the user is an admin
            next(); // Proceed if the user is authorized
        } else {
            return res.status(403).json({ message: "Not allowed, only user himself or admin" }); // Handle unauthorized access
        }
    });
}
