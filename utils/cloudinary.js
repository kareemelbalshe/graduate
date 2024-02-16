import cloudinary from 'cloudinary'
import { Error } from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const cloudinaryUploadImage = async (fileToUpload) => {
    try {
        const data = await cloudinary.v2.uploader.upload(fileToUpload, {
            resource_type: 'auto'
        })
        return data
    }
    catch (error) {
        return error
    }
}

export const cloudinaryRemoveImage = async (imagePublicId) => {
    try {
        const result = await cloudinary.v2.uploader.destroy(imagePublicId)
        return result
    }
    catch (error) {
        console.log(error)
        throw new Error("Internal Server Error (cloudinary)")
    }
}

export const cloudinaryRemoveMultipleImage = async (publicIds) => {
    try {
        const result = await cloudinary.v2.api.delete_resources(publicIds)
        return result
    }
    catch (error) {
        console.log(error)
        throw new Error("Internal Server Error (cloudinary)")
    }
}