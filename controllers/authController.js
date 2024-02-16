import asyncHandler from "express-async-handler"
import bcrypt from 'bcryptjs'
import User, { validateRegisterUser, validateLoginUser } from "../models/User.js"
import VerificationToken from "../models/VerificationToken.js"
// import sendEmail from '../utils/sendEmail.js'
import crypto from 'crypto'
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
        password: hashPassword
    })
    await user.save()

    const verificationToken = new VerificationToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex")
    })
    await verificationToken.save()
    const link = `http://localhost:3000/users/${user._id}/verify/${verificationToken.token}`
    const htmlTemplate = `
    <div>
        <p>Click on the link below to verify your email</p>
        <a href="${link}">Verify</a>
    </div>
    `
    await sendEmail(user.email, "Verify your Email", htmlTemplate)

    res.status(201).json({ message: "We send to you an email, please verify your email address" })
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
            verificationToken = new VerificationToken({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex")
            })
            await verificationToken.save()
        }
        const link = `http://localhost:3000/users/${user._id}/verify/${verificationToken.token}`
        const htmlTemplate = `
    <div>
        <p>Click on the link below to verify your email</p>
        <a href="${link}">Verify</a>
    </div>
    `
        await sendEmail(user.email, "Verify your Email", htmlTemplate)

        res.status(400).json({ message: "We send to you an email, please verify your email address" })
    }
    if(user.isBlocked===true){
        return res.status(500).json({ message: "Email is Blocked" })
    }
    const token = user.generateAuthToken()
    res.status(200).json({
        _id: user._id,
        role:user.role,
        photo: user.photo,
        token,
        username: user.username
    })
})

export const verifyUserAccountCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId)
    if (!user) {
        return res.status(400).json({ message: "invalid link" })
    }
    const verificationToken = await VerificationToken.findOne({
        userId: user._id,
        token: req.params.token
    })
    if (!verificationToken) {
        return res.status(400).json({ message: "invalid link" })
    }
    user.isAccountVerified = true
    await user.save()
    await verificationToken.remove()

    return res.status(200).json({ message: "Your account verified" })
})