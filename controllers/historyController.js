import path from 'path'
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const __dirname = path.resolve();  // This line is commented out, as it's an alternative way of getting the current directory.

import fs from "fs"
import History from "../models/History.js"
import { cloudinaryRemoveImage, cloudinaryUploadImage } from "../utils/cloudinary.js"
import asyncHandler from "express-async-handler"
import User from '../models/User.js';


// Controller function to create a new history entry
export const createHistory = asyncHandler(async (req, res) => {
    // Find the doctor who is creating the history entry
    const doctor = await User.findOne({ _id: req.user.id, role: "doctor" })
    // Check if an image is provided in the request
    if (!req.file) {
        return res.status(400).json({ message: "no image provided" })
    }

    // Get the file path of the uploaded image
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    // Upload the image to Cloudinary
    const result = await cloudinaryUploadImage(imagePath)

    // Create a new history entry
    const history = await History.create({
        description: req.body.description,
        category: req.body.category,
        date: req.body.date,
        doctor: doctor._id,
        user: req.params.id,
        image: {
            url: result.secure_url,
            publicId: result.public_id
        }
    })
    // Send the newly created history entry as a response
    res.status(201).json(history)

    // Delete the temporarily saved image from the server
    fs.unlinkSync(imagePath)
})

// Controller function to get all history entries
export const getAllHistory = asyncHandler(async (req, res) => {
    const { category } = req.body
    let history

    // If a category is provided, filter history entries by that category
    if (category) {
        history = await History.find({ category: category })
            .sort({ createdAt: -1 })
            .populate("user", "-password -wishlist -ChatList -Reservations")
            .populate("doctor", "-password -wishlist -ChatList -Reservations")
    }
    // Otherwise, get all history entries
    else {
        history = await History.find()
            .sort({ date: -1, createdAt: -1 })
            .populate("user", "-password -wishlist -ChatList -Reservations")
            .populate("doctor", "-password -wishlist -ChatList -Reservations")
    }
    // Send the history entries as a response
    res.status(200).json(history)
})

// Controller function to get history entries of a specific user
export const getUserHistory = asyncHandler(async (req, res) => {
    // Find history entries associated with the current user
    const history = await History.find({ user: req.user.id }).populate("doctor", "-likes -reviews -booking")

    // Send the user's history entries as a response
    res.status(200).json(history)
})

// Controller function to get a single history entry by its ID
export const getSingleHistory = asyncHandler(async (req, res) => {
    // Find a history entry by its ID
    const history = await History.findById(req.params.historyId)
        .populate("user", "-password -wishlist -ChatList -Reservations")
        .populate("doctor", "-password -wishlist -ChatList -Reservations")
    // If history entry not found, return a 404 response
    if (!history) {
        return res.status(404).json({ message: 'history not found' })
    }

    // Send the history entry as a response
    res.status(200).json(history)
})

// Controller function to delete a history entry by its ID
export const deleteHistory = asyncHandler(async (req, res) => {
    // Find the history entry to delete
    const history = await History.findById(req.params.historyId)
    // If history entry not found, return a 404 response
    if (!history) {
        return res.status(404).json({ message: 'history not found' })
    }

    // Check if the requester is authorized to delete the history entry
    if (req.user.role === 'admin' || req.user.id === history.user.toString() || req.user.id === history.doctor.toString()) {
        // Remove the image associated with the history entry from Cloudinary
        await cloudinaryRemoveImage(history.image.publicId)
        // Delete the history entry from the database
        await History.findByIdAndDelete(req.params.historyId)

        // Send a success message as a response
        res.status(200).json({ message: "history has been deleted successfully", historyId: history._id })
    }
    else {
        // If requester is not authorized, return a 403 response
        res.status(403).json({ message: "access denied, forbidden" })
    }
})

// Controller function to update a history entry by its ID
export const updateHistory = asyncHandler(async (req, res) => {

    // Find the history entry to update
    const history = await History.findById(req.params.historyId)
    // If history entry not found, return a 404 response
    if (!history) {
        return res.status(404).json({ message: 'history not found' })
    }

    // Check if the requester is authorized to update the history entry
    if (req.user.id !== history.doctor.toString()) {
        return res.status(403).json({ message: 'access denied,you are not allowed' })
    }

    // Update the history entry with the provided data
    const updateHistory = await History.findByIdAndUpdate(req.params.historyId, {
        $set: {
            description: req.body.description,
            category: req.body.category,
            date: req.body.date
        }
    }, { new: true }).populate("user", "-password -wishlist -ChatList -Reservations").populate("doctor", "-password -wishlist -ChatList -Reservations")

    // Send the updated history entry as a response
    res.status(200).json(updateHistory)
})

// Controller function to update the photo of a history entry
export const updateHistoryPhoto = asyncHandler(async (req, res) => {
    // Check if an image is provided in the request
    if (!req.file) {
        return res.status(400).json({ message: error.details[0].message })
    }

    // Find the history entry to update
    const history = await History.findById(req.params.historyId)
    // If history entry not found, return a 404 response
    if (!history) {
        return res.status(404).json({ message: 'history not found' })
    }

    // Remove the existing image associated with the history entry from Cloudinary
    await cloudinaryRemoveImage(history.image.publicId)

    // Get the file path of the uploaded image
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
    // Upload the new image to Cloudinary
    const result = await cloudinaryUploadImage(imagePath)

    // Update the history entry with the new image data
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