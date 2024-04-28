import asyncHandler from "express-async-handler"
import Location from "../models/location.js";

export const createLocation = asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.body;
    const location = new Location({
        userId: req.params.id, latitude, longitude,
    }, {
        $push: {
            timeSlots: req.body.timeSlots
        }
    });
    await location.save();
    res.status(201).json(location);
})
export const updateLocation = asyncHandler(async (req, res) => {
    const location = await Location.findOneAndUpdate({
        userId: req.params.id, _id: req.params.locationId,
    }, {
        $push: {
            timeSlots: req.body.timeSlots
        }
    });
    await location.save();
    res.status(201).json(location);
})

export const getAllLocations = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const locations = await Location.find({ userId }).populate("user", "-password -wishlist -ChatList -Reservations");
    res.json(locations);
})

export const getLocations = asyncHandler(async (req, res) => {
    const locations = await Location.find().populate("user", "-password -wishlist -ChatList -Reservations");
    res.json(locations);
})

export const deleteLocation = asyncHandler(async (req, res) => {
    const id = req.params.id;
    await Location.findByIdAndDelete(id);
    res.json({ message: 'Location deleted' });
})