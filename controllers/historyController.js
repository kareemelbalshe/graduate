import path from 'path'
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const __dirname = path.resolve();
import fs from "fs"
import History from "../models/History.js"
import { cloudinaryRemoveImage, cloudinaryUploadImage } from "../utils/cloudinary.js"
import asyncHandler from "express-async-handler"


export const createHistory = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "no image provided" })
    }

    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)

    const history = await History.create({
        description: req.body.description,
        category: req.body.category,
        user: req.user.id,
        date:req.body.date,
        image: {
            url: result.secure_url,
            publicId: result.public_id
        }
    })
    res.status(201).json(history)

    fs.unlinkSync(imagePath)
})

export const getAllHistory = asyncHandler(async (req, res) => {
    const { category } = req.query
    let history
    
    if (category) {
        history = await History.find({ category: category })
            .sort({ date: -1 })
            .populate("user", ["-password"])
    }
    else {
        history = await History.find()
            .sort({ date: -1 })
            .populate("user", ["-password"])
    }
    res.status(200).json(history)
})

export const getSingleHistory = asyncHandler( async (req, res) => {
    const history = await History.findById(req.params.historyId)
        .populate("user", ["-password"])
    if (!history) {
        return res.status(404).json({ message: 'history not found' })
    }

    res.status(200).json(history)
})

export const getHistoryCount = asyncHandler(async (req, res) => {
    const count = await History.count()

    res.status(200).json(count)
})

export const deleteHistory = asyncHandler(async (req, res) => {
    const history = await History.findById(req.params.historyId)
    if (!history) {
        return res.status(404).json({ message: 'history not found' })
    }
    
    if (req.user.role==='admin' || req.user.id === history.user.toString()) {
        await History.findByIdAndDelete(req.params.historyId)
        await cloudinaryRemoveImage(history.image.publicId)

        res.status(200).json({ message: "history has been deleted successfully", historyId: history._id })
    }
    else {
        res.status(403).json({ message: "access denied, forbidden" })
    }
})

export const updateHistory = asyncHandler(async (req, res) => {

    const history = await History.findById(req.params.historyId)
    if (!history) {
        return res.status(404).json({ message: 'history not found' })
    }

    if (req.user.id !== history.user.toString()) {
        return res.status(403).json({ message: 'access denied,you are not allowed' })
    }

    const updateHistory = await History.findByIdAndUpdate(req.params.historyId, {
        $set: {
            description: req.body.description,
            category: req.body.category,
            date:req.body.date
        }
    }, { new: true }).populate("user", ["-password"])

    res.status(200).json(updateHistory)
})

export const updateHistoryPhoto = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: error.details[0].message })
    }

    const history = await History.findById(req.params.historyId)
    if (!history) {
        return res.status(404).json({ message: 'history not found' })
    }

    if (req.user.id !== history.user.toString()) {
        return res.status(403).json({ message: 'access denied,you are not allowed' })
    }

    await cloudinaryRemoveImage(history.image.publicId)

    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)

    const updateHistory = await History.findByIdAndUpdate(req.params.historyId, {
        $set: {
            image: {
                url: result.secure_url,
                publicId: result.public_id
            }
        }
    }, { new: true })

    res.status(200).json(updateHistory)
    fs.unlinkSync(imagePath)
})