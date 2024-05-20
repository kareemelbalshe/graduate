import asyncHandler from "express-async-handler"; // Importing asyncHandler middleware for handling asynchronous functions
import bcrypt from 'bcryptjs'; // Importing bcrypt for password hashing
import User, { validateEmail, validateNewPassword } from "../models/User.js"; // Importing the User model and validation functions
import VerificationTokenSchema from "../models/VerificationToken.js"; // Importing the VerificationToken model
import sendEmail from '../utils/sendEmail.js'; // Importing sendEmail utility function

// Controller for sending reset password email containing OTP
export const sendResetPasswordCtrl = asyncHandler(async (req, res) => {
    // Validate the email received in the request body
    const { error } = validateEmail(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    // Find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ message: "User with given email does not exist!" });
    }
    // Check if there is an existing verification token for the user
    let verificationToken = await VerificationTokenSchema.findOne({ userId: user._id });
    if (!verificationToken) {
        // If not, generate a new OTP
        var charset = "0123456789";
        var code = "";
        for (var i = 0; i < 6; i++) {
            var randomIndex = Math.floor(Math.random() * charset.length);
            code += charset[randomIndex];
        }
        // Create a new verification token
        verificationToken = new VerificationTokenSchema({
            userId: user._id,
            token: code
        });
        // Save the verification token
        await verificationToken.save();
    }

    // HTML template for the email containing OTP
    const htmlTemplate = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 10% auto;padding: 20px; border: 1px solid gray;background-color: lavender; color: blueviolet;border-radius: 10px; width: 80%;">
        <h3 style="text-align: center; margin: 10px auto;padding: 0;">Your activation code is</h3>
        <h1 style="text-align: center; margin: 25px auto;padding: 10px 20px; background-color: blueviolet; color: white; border-radius: 12px;">${verificationToken.token}</h1>
        <h3 style="text-align: center; margin: 10px auto;padding: 0;">Greetings from the work team</h3>
        <h2 style="text-align: center; margin: 10px auto;padding: 0;">DOC on call</h2>
        <h5 style="text-align: center; margin: 10px auto;padding: 0;">All Rights reserved DOC on call</h5>
    </div>
    `;
    // Send the email with the OTP
    await sendEmail(user.email, "Reset Password", htmlTemplate);
    // Respond with success message and user ID
    res.status(200).json({ message: "OTP sent,Please check your email", userId: user._id });
});

// Controller for resetting password using OTP
export const resetPasswordCtrl = asyncHandler(async (req, res) => {
    // Validate the new password received in the request body
    const { error } = validateNewPassword(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    // Find user by ID
    const user = await User.findById(req.params.userId);
    if (!user) {
        return res.status(404).json({ message: "user not found" });
    }
    // Find verification token for the user and match it with the OTP received
    const verificationToken = await VerificationTokenSchema.findOne({
        userId: user._id,
        token: req.body.code
    });
    if (!verificationToken) {
        return res.status(400).json({ message: "invalid otp" });
    }
    // If account is not verified, set it to verified
    if (!user.isAccountVerified) {
        user.isAccountVerified = true;
    }
    // Check if password and confirm password match
    if (req.body.password === req.body.confirmPassword) {
        // Generate salt and hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        // Update user's password with the new hashed password
        user.password = hashedPassword;
        await user.save();
        // Delete the verification token after password reset
        await verificationToken.deleteOne({ userId: req.params.userId });
    } else {
        res.status(500).json({ message: "password and confirm not match" });
    }
    // Respond with success message
    res.status(200).json({ message: "Password reset successfully, please log in" });
});
