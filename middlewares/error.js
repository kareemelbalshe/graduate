// Middleware to handle not found errors
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
export const notFound = (req, res, next) => {
    // Create a new error with the message including the original URL
    const error = new Error(`Not found - ${req.originalUrl}`);
    // Set the response status to 404 (Not Found)
    res.status(404);
    // Pass the error to the next middleware
    next(error);
}

// Middleware to handle general errors
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
export const errorHandler = (err, req, res, next) => {
    // Determine the status code; use 500 if the status code is 200
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Set the response status to the determined status code
    res.status(statusCode).json({
        // Send the error message
        message: err.message,
        // Send the stack trace only in development mode
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
}
