import asyncHandler from "express-async-handler"
import Location from "../models/location.js";
import Doctor from "../models/Doctor.js";

// Controller for creating a new location
export const createLocation = asyncHandler(async (req, res) => {
    const { latitude, longitude } = req.body;

    // Create a new location instance
    const location = new Location({
        userId: req.params.id,
        latitude,
        longitude,
        address: req.body.address,
    });

    // Save the location to the database
    await location.save();
    await Doctor.findByIdAndUpdate(req.params.id, {
        $push: {
            clinic: location._id
        }
    })

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
        address: req.body.address,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
    })
    // Save the updated location
    await location.save();

    // Respond with the updated location
    res.status(201).json(location);
})

export const getLocation = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.locationId)
    if (!location) {
        return res.status(404).json({ message: "Location not found" })
    }
    res.status(200).json(location)
})

export const setTimeSlot = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.locationId)
    if (!location) {
        return res.status(404).json({ message: "Location not found" })
    }
    var charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var id = "";
    for (var i = 0; i < 10; i++) {
        var randomIndex = Math.floor(Math.random() * charset.length);
        id += charset[randomIndex];
    }
    const timeSlot = {
        id: id,
        day: req.body.day,
        from: req.body.from,
        to: req.body.to,
        date: Date.now()
    }
    location.timeSlots.push(timeSlot)
    await location.save()

    deleteOldTimeSlots();
    res.status(200).json(location)
})

export const updateTimeSlot = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.locationId)
    if (!location) {
        return res.status(404).json({ message: "Location not found" })
    }
    const timeSlot = req.params.timeSlotId
    location.timeSlots.map(async (slot) => {
        if (slot.id === timeSlot.id) {
            slot.day = timeSlot.day
            slot.from = timeSlot.from
            slot.to = timeSlot.to
        }
    })
    await location.save()

    res.status(200).json(location)
})

export const deleteTimeSlot = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.locationId)
    if (!location) {
        return res.status(404).json({ message: "Location not found" })
    }
    const timeSlot = req.params.timeSlotId
    location.timeSlots.splice(location.timeSlots.indexOf(timeSlot), 1)
    await location.save()

    res.status(200).json(location)
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

const deleteOldTimeSlots = async () => {
    try {
        // Calculate the date one week ago from now
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Find locations with time slots older than one week and remove those time slots
        const locations = await Location.find({
            'timeSlots.date': { $lt: oneWeekAgo }
        });

        for (const location of locations) {
            location.timeSlots = location.timeSlots.filter(slot => slot.createdAt >= oneWeekAgo);
            await location.save();
        }

        console.log('Old time slots deleted successfully.');
    } catch (error) {
        console.error('Error deleting old time slots:', error);
    }
};

