import path from 'path'
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const __dirname = path.resolve();
import fs from "fs"
import History from "../models/History.js"
import { cloudinaryRemoveImage, cloudinaryUploadImage } from "../utils/cloudinary.js"


export const createHistory = async (req, res) => {
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
}

export const getAllHistory = async (req, res) => {
    const { category } = req.query
    let history
    
    if (category) {
        history = await History.find({ category: category })
            .sort({ createdAt: -1 })
            .populate("user", ["-password"])
    }
    else {
        history = await History.find()
            .sort({ createdAt: -1 })
            .populate("user", ["-password"])
    }
    res.status(200).json(history)
}

export const getSingleHistory = async (req, res) => {
    const history = await History.findById(req.params.id)
        .populate("user", ["-password"])
    if (!history) {
        return res.status(404).json({ message: 'history not found' })
    }

    res.status(200).json(history)
}

export const getHistoryCount = async (req, res) => {
    const count = await History.count()

    res.status(200).json(count)
}

export const deleteHistory = async (req, res) => {
    const history = await History.findById(req.params.id)
    if (!history) {
        return res.status(404).json({ message: 'history not found' })
    }
    
    if (req.user.role==='admin' || req.user.id === history.user.toString()) {
        await History.findByIdAndDelete(req.params.id)
        await cloudinaryRemoveImage(history.image.publicId)

        res.status(200).json({ message: "history has been deleted successfully", historyId: history._id })
    }
    else {
        res.status(403).json({ message: "access denied, forbidden" })
    }
}

export const updateHistory = async (req, res) => {

    const history = await History.findById(req.params.id)
    if (!history) {
        return res.status(404).json({ message: 'history not found' })
    }

    if (req.user.id !== history.user.toString()) {
        return res.status(403).json({ message: 'access denied,you are not allowed' })
    }

    const updateHistory = await History.findByIdAndUpdate(req.params.id, {
        $set: {
            description: req.body.description,
            category: req.body.category,
            date:req.body.date
        }
    }, { new: true }).populate("user", ["-password"])

    res.status(200).json(updateHistory)
}

export const updateHistoryPhoto = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: error.details[0].message })
    }

    const history = await History.findById(req.params.id)
    if (!history) {
        return res.status(404).json({ message: 'history not found' })
    }

    if (req.user.id !== history.user.toString()) {
        return res.status(403).json({ message: 'access denied,you are not allowed' })
    }

    await cloudinaryRemoveImage(history.image.publicId)

    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    const result = await cloudinaryUploadImage(imagePath)

    const updateHistory = await History.findByIdAndUpdate(req.params.id, {
        $set: {
            image: {
                url: result.secure_url,
                publicId: result.public_id
            }
        }
    }, { new: true })

    res.status(200).json(updateHistory)
    fs.unlinkSync(imagePath)
}