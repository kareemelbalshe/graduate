import asyncHandler from "express-async-handler"
import bcrypt from 'bcryptjs'
import User, { validateEmail, validateNewPassword } from "../models/User.js"
import VerificationTokenSchema from "../models/VerificationToken.js"
import sendEmail from '../utils/sendEmail.js'
// import crypto from 'crypto'

export const sendResetPasswordCtrl = asyncHandler(async (req, res) => {
    const { error } = validateEmail(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(404).json({ message: "User with given email does not exist!" })
    }
    let verificationToken = await VerificationTokenSchema.findOne({ userId: user._id })
    if (!verificationToken) {
        var charset = "0123456789";
        var code = "";
        for (var i = 0; i < 6; i++) {
            var randomIndex = Math.floor(Math.random() * charset.length);
            code += charset[randomIndex];
        }
        verificationToken = new VerificationTokenSchema({
            userId: user._id,
            token: code
        })
        await verificationToken.save()
    }

    // const link = `http://localhost:58217/reset-password/${user._id}/${verificationToken.token}`
    const htmlTemplate = `
    <div>
        <p>Your code to reset your password</p>
        <h1>${verificationToken.token}</h1>
        <p>Greetings from the work team</p>
        <h2>DOC on call</h2>
    </div>
    `
    await sendEmail(user.email, "Reset Password", htmlTemplate)
    res.status(200).json({ message: "OTP sent,Please check your email", userId: user._id })
})

export const resetPasswordCtrl = asyncHandler(async (req, res) => {
    const { error } = validateNewPassword(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    const user = await User.findById(req.params.userId)
    if (!user) {
        return res.status(404).json({ message: "user not found" })
    }
    const verificationToken = await VerificationTokenSchema.findOne({
        userId: user._id,
        token: req.body.code
    })
    if (!verificationToken) {
        return res.status(400).json({ message: "invalid otp" })
    }
    if (!user.isAccountVerified) {
        user.isAccountVerified = true
    }
    if (req.body.password === req.body.confirmPassword) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        user.password = hashedPassword
        await user.save()
        await verificationToken.deleteOne({ userId: req.params.userId })
    }
    else{
        res.status(500).json({ message: "password and confirm not match" })
    }
    res.status(200).json({ message: "Password reset successfully, please log in" })
})