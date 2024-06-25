import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

// Function to connect to MongoDB
// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
export const connectDB = async () => {
    try {
        // Try to connect to MongoDB using the URL from environment variables
        await mongoose.connect(process.env.MONGO_URL_LIVE || process.env.MONGO_URL);
        console.log("Connected to MongoDB ^_^"); // Log success message
    } catch (error) {
        console.log("Connection failed ", error); // Log error message if connection fails
    }
}
