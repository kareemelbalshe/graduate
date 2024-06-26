import asyncHandler from "express-async-handler";
import bcrypt from 'bcryptjs';
import User, { validateRegisterUser, validateLoginUser } from "../models/User.js";
import VerificationToken from "../models/VerificationToken.js";
import sendEmail from '../utils/sendEmail.js';

/** 
 * @desc Register New User
 * @route POST /api/auth/register
 * @access Public
 * // Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
 */
export const registerUserCtrl = asyncHandler(async (req, res) => {
    // Validate user input
    const { error } = validateRegisterUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Check if the user already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
        return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
        birthday: req.body.birthday,
        gender: req.body.gender,
        phone: req.body.phone
    });
    await user.save();

    // Generate a verification code
    var charset = "0123456789";
    var code = "";
    for (var i = 0; i < 6; i++) {
        var randomIndex = Math.floor(Math.random() * charset.length);
        code += charset[randomIndex];
    }

    // Save the verification token
    const verificationToken = new VerificationToken({
        userId: user._id,
        token: code
    });
    await verificationToken.save();

    // Send verification email
    const htmlTemplate = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 10% auto;padding: 20px; border: 1px solid gray;background-color: lavender; color: blueviolet;border-radius: 10px; width: 80%;">
        <h3 style="text-align: center; margin: 10px auto;padding: 0;">Your activation code is</h3>
        <h1 style="text-align: center; margin: 25px auto;padding: 10px 20px; background-color: blueviolet; color: white; border-radius: 12px;">${verificationToken.token}</h1>
        <h3 style="text-align: center; margin: 10px auto;padding: 0;">Greetings from the work team</h3>
        <h2 style="text-align: center; margin: 10px auto;padding: 0;">DOC on call</h2>
        <h5 style="text-align: center; margin: 10px auto;padding: 0;">All Rights reserved DOC on call</h5>
    </div>`;
    await sendEmail(user.email, "Verify your Email", htmlTemplate);

    res.status(201).json({ message: "We sent you an email, please verify your email address", id: user._id });
});

/** 
 * @desc Login New User
 * @route POST /api/auth/login
 * @access Public
 * // Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
 */
export const loginUserCtrl = asyncHandler(async (req, res) => {
    // Validate user input
    const { error } = validateLoginUser(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    // Check if the user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the password is correct
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if the user's account is verified
    if (!user.isAccountVerified) {
        let verificationToken = await VerificationToken.findOne({ userId: user._id });
        if (!verificationToken) {
            // Generate a new verification code
            var charset = "0123456789";
            var code = "";
            for (var i = 0; i < 6; i++) {
                var randomIndex = Math.floor(Math.random() * charset.length);
                code += charset[randomIndex];
            }

            // Save the verification token
            verificationToken = new VerificationToken({
                userId: user._id,
                token: code
            });
            await verificationToken.save();
        }

        // Send verification email
        const htmlTemplate = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 10% auto;padding: 20px; border: 1px solid gray;background-color: lavender; color: blueviolet;border-radius: 10px; width: 80%;">
        <h3 style="text-align: center; margin: 10px auto;padding: 0;">Your activation code is</h3>
        <h1 style="text-align: center; margin: 25px auto;padding: 10px 20px; background-color: blueviolet; color: white; border-radius: 12px;">${verificationToken.token}</h1>
        <h3 style="text-align: center; margin: 10px auto;padding: 0;">Greetings from the work team</h3>
        <h2 style="text-align: center; margin: 10px auto;padding: 0;">DOC on call</h2>
        <h5 style="text-align: center; margin: 10px auto;padding: 0;">All Rights reserved DOC on call</h5>
    </div>
    `;
        await sendEmail(user.email, "Verify your Email", htmlTemplate);

        res.status(500).json({ message: "We sent you an email, please verify your email address", id: user._id });
    }

    // Check if the user's account is blocked
    if (user.isBlocked === true) {
        return res.status(500).json({ message: "Email is Blocked" });
    }

    // Generate authentication token
    const token = user.generateAuthToken();
    res.status(200).json({
        photo: user.photo,
        token,
        username: user.username,
        _id: user._id,
        role: user.role,
    });
});

/** 
 * @desc Verify User Account
 * @route GET /api/auth/verify/:userId
 * @access Public
 */
export const verifyUserAccountCtrl = asyncHandler(async (req, res) => {
    // Find the user by ID
    const user = await User.findById(req.params.userId);
    if (!user) {
        return res.status(400).json({ message: "Invalid user" });
    }

    // Find the verification
    const verificationToken = await VerificationToken.findOne({
        userId: user._id,
        token: req.body.code
    })
    if (!verificationToken) {
        return res.status(400).json({ message: "invalid code" })
    }
    user.isAccountVerified = true
    await user.save()
    await verificationToken.deleteOne({ userId: req.params.userId })

    return res.status(200).json({ message: "Your account verified" })
})