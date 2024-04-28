import asyncHandler from "express-async-handler"
import bcrypt from 'bcryptjs'
import User, { validateRegisterUser, validateLoginUser } from "../models/User.js"
import VerificationToken from "../models/VerificationToken.js"
import sendEmail from '../utils/sendEmail.js'
// import crypto from 'crypto'
/** ------------------------
*@desc Register New User
*@router /api/auth/register
*@method Post
*@access public
*----------------------------
*/

export const registerUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateRegisterUser(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    let user = await User.findOne({ email: req.body.email })
    if (user) {
        return res.status(400).json({ message: "user already exist" })
    }
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(req.body.password, salt)
    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashPassword,
        birthday: req.body.birthday,
        gender: req.body.gender
    })
    await user.save()

    var charset = "0123456789";
    var code = "";
    for (var i = 0; i < 6; i++) {
        var randomIndex = Math.floor(Math.random() * charset.length);
        code += charset[randomIndex];
    }

    const verificationToken = new VerificationToken({
        userId: user._id,
        token: code
    })
    await verificationToken.save()
    const htmlTemplate = `
    <div>
        <p>Your code is</p>
        <h1>${verificationToken.token}</h1>
        <p>Greetings from the work team</p>
        <h2>DOC on call</h2>
    </div>`
    await sendEmail(user.email, "Verify your Email", htmlTemplate)

    res.status(201).json({ message: "We send to you an email, please verify your email address", id: user._id })
})
/** ------------------------
*@desc login New User
*@router /api/auth/login
*@method Post
*@access public
*----------------------------
*/
export const loginUserCtrl = asyncHandler(async (req, res) => {
    const { error } = validateLoginUser(req.body)
    if (error) {
        return res.status(400).json({ message: error.details[0].message })
    }
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        return res.status(400).json({ message: "invalid email or password" })
    }
    const isPasswordMatch = await bcrypt.compare(req.body.password, user.password)
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "invalid email or password" })
    }
    if (!user.isAccountVerified) {
        let verificationToken = await VerificationToken.findOne({ userId: user._id })
        if (!verificationToken) {

            var charset = "0123456789";
            var code = "";
            for (var i = 0; i < 6; i++) {
                var randomIndex = Math.floor(Math.random() * charset.length);
                code += charset[randomIndex];
            }

            verificationToken = new VerificationToken({
                userId: user._id,
                token: code
            })
            await verificationToken.save()
        }
        const htmlTemplate = `
    <div>
        <p>Your code is</p>
        <h1>${verificationToken.token}</h1>
        <p>Greetings from the work team</p>
        <h2>DOC on call</h2>
    </div>
    `
        await sendEmail(user.email, "Verify your Email", htmlTemplate)

        res.status(400).json({ message: "We send to you an email, please verify your email address" })
    }
    if (user.isBlocked === true) {
        return res.status(500).json({ message: "Email is Blocked" })
    }
    const token = user.generateAuthToken()

    res.status(200).json({
        _id: user._id,
        role: user.role,
        photo: user.photo,
        token,
        username: user.username
    })
})

export const verifyUserAccountCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId)
    if (!user) {
        return res.status(400).json({ message: "invalid user" })
    }
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