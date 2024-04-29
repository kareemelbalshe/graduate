import Stripe from 'stripe'
import Doctor from '../models/Doctor.js'
import User from '../models/User.js'
import Booking from '../models/Booking.js'
import asyncHandler from "express-async-handler"


export const getCheckoutSession=asyncHandler(async(req,res)=>{
    try {
        const doctor=await Doctor.findOne({user:req.params.id})
        const user=await User.findById(req.user.id)
        const book=await Booking.findOne({user:req.user.id,doctor:req.params.id,createdAt:-1})
        console.log(book)
        if(book.status==="approved"||book.status==="cancelled"){
        const booking=new Booking({
            doctor:req.params.id,
            user:req.user.id,
            ticketPrice:doctor.ticketPrice,
            status:"pending"
        })
        await booking.save()
        doctor.booking.push(booking)
        user.Reservations.push(booking)
        res.status(200).json({success:true,message:'Successfully booking',booking})
    }
    else{
        res.status(500).json({success:false,message:'wait until approv'})
    }
    } catch (error) {
        res.status(500).json({success:false,message:'Error creating checkout session'})
    }
})

export const approvedBooking=asyncHandler(async(req,res)=>{
    const book=await Booking.findByIdAndUpdate(req.params.id,{
        $set:{
            status:"approved"
        }
    })
    res.status(200).json({success:true,message:'Successfully approved',book})
})

export const cancelledBooking=asyncHandler(async(req,res)=>{
    const book=await Booking.findByIdAndUpdate(req.params.id,{
        $set:{
            status:"cancelled"
        }
    })
    res.status(200).json({success:true,message:'Successfully approved',book})
})

export const getAllBooking=asyncHandler(async(req,res)=>{
    const booking=await Booking.find().populate("user").populate("doctor")
    res.status(200).json({success:true,booking})
})