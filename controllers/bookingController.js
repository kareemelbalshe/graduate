// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com

import Doctor from '../models/Doctor.js'
import User from '../models/User.js'
import Booking from '../models/Booking.js'
import asyncHandler from "express-async-handler"

// Endpoint to create a new booking
export const getCheckoutSession = asyncHandler(async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.params.id })
        const booking = new Booking({
            doctor: req.params.id,
            user: req.user.id,
            ticketPrice: doctor.ticketPrice,
            status: "pending"
        })
        await booking.save()
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
        res.status(200).json({ success: true, message: 'Successfully booked', booking })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating booking' })
    }
})

// Endpoint to get bookings related to a doctor
export const getBookingToDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ user: req.user.id })
    const book = doctor.booking
    const booking = await Booking.find({ _id: { $in: book } }).populate("user", "-password -wishlist -ChatList -Reservations")
    res.status(200).json(booking)
})

// Endpoint to get bookings related to a patient
export const getBookingToPatient = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    const book = user.Reservations
    const reservations = await Booking.find({ _id: { $in: book } }).populate("doctor", "-password -wishlist -ChatList -Reservations")
    res.status(200).json(reservations)
})

// Endpoint to approve a booking
export const approvedBooking = asyncHandler(async (req, res) => {
    const book = await Booking.findByIdAndUpdate(req.params.bookingId, {
        $set: {
            status: "approved",
            time: req.body.time,
            cancelReason: ""
        }
    }).populate("user", "-password -wishlist -ChatList").populate("doctor", "-password -wishlist -ChatList").sort({ createdAt: -1 })
    res.status(200).json({ success: true, message: 'Successfully approved', data: book })
})

// Endpoint to cancel a booking
export const cancelledBooking = asyncHandler(async (req, res) => {
    const book = await Booking.findByIdAndUpdate(req.params.bookingId, {
        $set: {
            status: "cancelled",
            cancelReason: req.body.reason,
            time: ""
        }
    }).populate("user", "-password -wishlist -ChatList").populate("doctor", "-password -wishlist -ChatList").sort({ createdAt: -1 })
    res.status(200).json({ success: true, message: 'Successfully cancelled', data: book })
})

// Endpoint to get all bookings
export const getAllBooking = asyncHandler(async (req, res) => {
    const booking = await Booking.find().populate("user", "-password -wishlist -ChatList").populate("doctor", "-password -wishlist -ChatList").sort({ createdAt: -1 })
    res.status(200).json({ success: true, booking })
})

// Endpoint to delete a booking
export const deleteBooking = asyncHandler(async (req, res) => {
    await Booking.findByIdAndDelete(req.params.bookingId)
    res.status(200).json({ success: true, message: "Booking deleted" })
})
