import cloudinary from 'cloudinary'
import { Error } from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

// Configuration for Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Function to upload an image to Cloudinary
export const cloudinaryUploadImage = async (fileToUpload) => {
    try {
        // Upload the image and retrieve the data
        const data = await cloudinary.v2.uploader.upload(fileToUpload, {
            resource_type: 'auto'
        })
        return data
    }
    catch (error) {
        return error
    }
}

// Function to remove an image from Cloudinary
export const cloudinaryRemoveImage = async (imagePublicId) => {
    try {
        // Delete the image using the public image ID
        const result = await cloudinary.v2.uploader.destroy(imagePublicId)
        return result
    }
    catch (error) {
        console.log(error)
        // If deletion fails, throw an error
        throw new Error("Internal Server Error (cloudinary)")
    }
}

// Function to remove multiple images from Cloudinary
export const cloudinaryRemoveMultipleImage = async (publicIds) => {
    try {
        // Delete multiple images using their public IDs
        const result = await cloudinary.v2.api.delete_resources(publicIds)
        return result
    }
    catch (error) {
        console.log(error)
        // If deletion fails, throw an error
        throw new Error("Internal Server Error (cloudinary)")
    }
}

// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
