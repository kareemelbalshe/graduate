import asyncHandler from "express-async-handler"
import Location from "../models/location.js";

// Controller for creating a new location
export const createLocation = asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.body;

    // Create a new location instance
    const location = new Location({
        userId: req.params.id,
        latitude,
        longitude,
        address: req.body.address,
        timeSlots: req.body.timeSlots // Assuming timeSlots is an array of time slots
    });

    // Save the location to the database
    await location.save();

    // Respond with the created location
    res.status(201).json(location);
})

// Controller for updating an existing location
export const updateLocation = asyncHandler(async (req, res) => {
    // Find the location by user ID and location ID
    const location = await Location.findOneAndUpdate({
        userId: req.params.id,
        _id: req.params.locationId,
    }, {
        // Push new time slots to the existing timeSlots array
        $push: {
            timeSlots: req.body.timeSlots
        }
    });

    // Save the updated location
    await location.save();

    // Respond with the updated location
    res.status(201).json(location);
})

// Controller for fetching all locations of a specific user
export const getAllLocations = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Find all locations associated with the user ID
    const locations = await Location.find({ userId: userId }).populate("user", "-password -wishlist -ChatList -Reservations");

    // Respond with the retrieved locations
    res.json(locations);
})

// Controller for fetching all locations
export const getLocations = asyncHandler(async (req, res) => {
    // Find all locations
    const locations = await Location.find().populate("user", "-password -wishlist -ChatList -Reservations");

    // Respond with the retrieved locations
    res.json(locations);
})

// Controller for deleting a location by its ID
export const deleteLocation = asyncHandler(async (req, res) => {
    const id = req.params.locationId;

    // Find the location by its ID and delete it
    await Location.findByIdAndDelete(id);

    // Respond with a success message
    res.json({ message: 'Location deleted' });
})
