import Doctor from '../models/Doctor.js'
import User from '../models/User.js'
import Booking from '../models/Booking.js'
import asyncHandler from "express-async-handler"


export const getCheckoutSession = asyncHandler(async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.params.id })
        // const user = await User.findById(req.user.id)
        // const book = await Booking.find({ user: req.user.id, doctor: req.params.id})
        const booking = new Booking({
            doctor: req.params.id,
            user: req.user.id,
            ticketPrice: doctor.ticketPrice,
            status: "pending"
        })
        booking.save()
        await Doctor.findOneAndUpdate({ user: req.params.id }, {
            $push: {
                booking: booking._id
            }
        })
        await User.findByIdAndUpdate(req.user.id, {
            $push: {
                Reservations: booking._id
            }
        })
        res.status(200).json({ success: true, message: 'Successfully booking', booking })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating booking' })
    }
})

export const getBookingToDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ user: req.user.id })

    const book = doctor.booking
    const booking = await Booking.find({ _id: { $in: book } }).populate("user", "-password -wishlist -ChatList -Reservations")

    res.status(200).json(booking)
})

export const getBookingToPatient = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    const book = user.Reservations
    const reservations = await Booking.find({ _id: { $in: book } }).populate("doctor", "-password -wishlist -ChatList -Reservations")
    res.status(200).json(reservations)
})

export const setTime=asyncHandler(async (req, res) => {
    let book=await Booking.findById(req.params.bookingId)
        if(book.status==="approved"){
            book=await Booking.findByIdAndUpdate(req.params.bookingId,{
                $set:{
                    time:req.body.time
                }
            })
            res.status(200).json(book)
        }
        else{
            res.status(200).json({message:"you should approve"})
        }
})

export const approvedBooking = asyncHandler(async (req, res) => {
    const book = await Booking.findByIdAndUpdate(req.params.bookingId, {
        $set: {
            status: "approved"
        }
    }).populate("user", "-password -wishlist -ChatList").populate("doctor", "-password -wishlist -ChatList").select("doctors").sort({ createdAt: -1 })
    res.status(200).json({ success: true, message: 'Successfully approved', book })
})

export const cancelledBooking = asyncHandler(async (req, res) => {
    const book = await Booking.findByIdAndUpdate(req.params.bookingId, {
        $set: {
            status: "cancelled"
        }
    }).populate("user", "-password -wishlist -ChatList").populate("doctor", "-password -wishlist -ChatList").select("doctors").sort({ createdAt: -1 })
    res.status(200).json({ success: true, message: 'Successfully approved', book })
})

export const getAllBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.find().populate("user", "-password -wishlist -ChatList").populate("doctor", "-password -wishlist -ChatList").select("doctors").sort({ createdAt: -1 })
    res.status(200).json({ success: true, booking })
})

export const deleteBooking = asyncHandler(async (req, res) => {
    await Booking.findByIdAndDelete(req.params.bookingId)
    res.status(200).json({ success: true, message: "booking deleted" })
})