import Doctor from "../models/Doctor.js"
import Review from "../models/Review.js"
import User from "../models/User.js"

export const getAllReviews=async(req,res)=>{
    try {
        const reviews=await Review.find()
        res.status(200).json({success:true,message:"successful",data:reviews})
    } catch (error) {
        res.status(404).json({success:false,message:"Not found"})
    }
}

export const createReview=async(req,res)=>{

    const newReview=new Review(req.body)
    const savedReview=await newReview.save()
    const user=await User.findById(req.body.user)
        await Doctor.findOneAndUpdate({user:user._id},{
            $push:{reviews:savedReview._id}})
    res.status(200).json({success:true,message:"Review submitted",data:newReview})
}

export const deleteReview=async(req,res)=>{
    await Review.findOneAndRemove(req.body.reviewId)
    res.status(200).json({success:true,message:"Review deleted"})
}