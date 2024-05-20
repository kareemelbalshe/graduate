import express from "express";
import { connectDB } from "./config/connectToDB.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import rateLimiting from "express-rate-limit";
import dotenv from 'dotenv';
import authRoute from './routes/authRoute.js';
import userRoute from './routes/userRoute.js';
import messageRoute from './routes/messageRoute.js';
import passwordRoute from './routes/passwordRoute.js';
import { app, server } from "./middlewares/socket.js";
import xss from 'xss-clean';
import hpp from "hpp";
import helmet from "helmet";
import bodyParser from 'body-parser';

dotenv.config();

// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com

//https://graduate-wgus.onrender.com

// Initialize express app
app.use(express.json());

// Use body-parser to parse JSON bodies
app.use(bodyParser.json());

// Set security-related HTTP headers
app.use(helmet());

// Protect against HTTP Parameter Pollution attacks
app.use(hpp());

// Clean user input to prevent XSS attacks
app.use(xss());

// Apply rate limiting to all requests
app.use(rateLimiting({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200 // limit each IP to 200 requests per windowMs
}));

// Define routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/message", messageRoute);
app.use("/api/password", passwordRoute);

// Use custom middlewares for handling errors
app.use(notFound);
app.use(errorHandler);

// Start the server and connect to the database
server.listen(process.env.PORT, () => {
    connectDB();
    console.log(`Server started at http://localhost:${process.env.PORT}`);
});
