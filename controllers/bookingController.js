// Copy right for Kareem Elbalshy kareemelbalshe1234@gmail.com
import cron from 'node-cron';
import Doctor from '../models/Doctor.js'
import User from '../models/User.js'
import Booking from '../models/Booking.js'
import asyncHandler from "express-async-handler"
import Location from '../models/location.js'

// Endpoint to create a new booking
export const getCheckoutSessionClinic = asyncHandler(async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.params.id })
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' })
        }

        const booking = new Booking({
            doctor: req.params.id,
            user: req.user.id,
            status: "pending",
            toPerson: req.body.toPerson,
            complaining: req.body.complaining,
            age: req.body.age,
            gender: req.body.gender
        })
        const timeSlot = req.body.timeSlots
        const clinic = await Location.findOne({ _id: req.params.locationId, userId: req.params.id })
        await Promise.all(clinic.timeSlots.map(async (time) => {
            if (time.id === timeSlot) {
                if (time.taken === true) {
                    return res.status(400).json({ success: false, message: 'Time is already taken' })
                }
                booking.time.id = time.id
                booking.time.day = time.day
                booking.time.from = time.from
                booking.time.to = time.to
                time.taken = true
                time.date = Date.now()
                await clinic.save()
            }
        }))
        booking.ticketPrice = doctor.ticketPriceClinic
        booking.clinic = clinic._id

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
        res.status(200).json({ success: true, message: 'Successfully booked', booking: booking })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating booking' })
    }
})

export const getCheckoutSessionHome = asyncHandler(async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.params.id })
        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' })
        }

        const booking = new Booking({
            doctor: req.params.id,
            user: req.user.id,
            status: "pending",
            kind: "home",
            toPerson: req.body.toPerson,
            complaining: req.body.complaining,
            age: req.body.age
        })

        booking.ticketPrice = doctor.ticketPriceHome

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
        res.status(200).json({ success: true, message: 'Successfully booked', booking: booking })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating booking' })
    }
})

cron.schedule('0 0 * * *', async () => {
    try {
        // Calculate the date one week ago from now
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Delete bookings older than one week
        const result = await Booking.deleteMany({ createdAt: { $lt: oneWeekAgo } });

        console.log(`Deleted ${result.deletedCount} outdated bookings.`);
    } catch (error) {
        console.error('Error deleting outdated bookings:', error);
    }
});


// Endpoint to get bookings related to a doctor
export const getBookingToDoctor = asyncHandler(async (req, res) => {
    const doctor = await Doctor.findOne({ user: req.user.id })
    if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' })
    }
    const book = doctor.booking
    const booking = await Booking.find({ _id: { $in: book } }).populate("user", "-password -wishlist -ChatList -Reservations").sort({ createdAt: -1 })
    res.status(200).json(booking)
})

// Endpoint to get bookings related to a patient
export const getBookingToPatient = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' })
    }
    const book = user.Reservations
    const reservations = await Booking.find({ _id: { $in: book } }).populate("doctor", "-password -wishlist -ChatList -Reservations").sort({ createdAt: -1 })
    res.status(200).json(reservations)
})

// Endpoint to approve a booking
export const approvedBooking = asyncHandler(async (req, res) => {

    let book = await Booking.findById(req.params.bookingId)
    if (book.kind === "clinic") {
        book = await Booking.findByIdAndUpdate(req.params.bookingId, {
            $set: {
                status: "approved",
                cancelReason: ""
            }
        }).populate("user", "-password -wishlist -ChatList").populate("doctor", "-password -wishlist -ChatList").sort({ createdAt: -1 })
    }
    else {
        book = await Booking.findByIdAndUpdate(req.params.bookingId, {
            $set: {
                status: "approved",
                cancelReason: "",
                time: req.body.time
            }
        }).populate("user", "-password -wishlist -ChatList").populate("doctor", "-password -wishlist -ChatList").sort({ createdAt: -1 })
    }
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
    if (!booking) {
        return res.status(404).json({ success: false, message: 'No booking found' })
    }
    res.status(200).json({ success: true, booking: booking })
})

// Endpoint to delete a booking
export const deleteBooking = asyncHandler(async (req, res) => {
    await Booking.findByIdAndDelete(req.params.bookingId)
    res.status(200).json({ success: true, message: "Booking deleted" })
})
