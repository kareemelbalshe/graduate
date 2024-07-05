import asyncHandler from "express-async-handler";
import Location from "../models/location.js";
import Doctor from "../models/Doctor.js";
import Booking from "../models/Booking.js";
import cron from 'node-cron';

// Controller for creating a new location
export const createLocation = asyncHandler(async (req, res) => {
    const { latitude, longitude, address } = req.body;

    // Create a new location instance
    const location = new Location({
        userId: req.params.id,
        latitude,
        longitude,
        address,
    });

    // Save the location to the database and update the doctor's clinic
    await location.save();
    await Doctor.findByIdAndUpdate(req.params.id, {
        $push: { clinic: location._id }
    });

    // Respond with the created location
    res.status(201).json(location);
});

// Controller for updating an existing location
export const updateLocation = asyncHandler(async (req, res) => {
    // Find the location by user ID and location ID and update its fields
    const location = await Location.findOneAndUpdate(
        { userId: req.params.id, _id: req.params.locationId },
        { address: req.body.address, latitude: req.body.latitude, longitude: req.body.longitude },
        { new: true } // Return the updated document
    );

    if (!location) {
        return res.status(404).json({ message: "Location not found" });
    }

    // Respond with the updated location
    res.status(200).json(location);
});

// Controller for getting a location by its ID
export const getLocation = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.locationId);

    if (!location) {
        return res.status(404).json({ message: "Location not found" });
    }

    // Respond with the retrieved location
    res.status(200).json(location);
});

// Controller for setting time for a location
export const setTime = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.locationId);

    if (!location) {
        return res.status(404).json({ message: "Location not found" });
    }

    // Generate a random ID for the time entry
    const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let id = "";
    for (let i = 0; i < 10; i++) {
        id += charset[Math.floor(Math.random() * charset.length)];
    }

    const time = {
        id,
        day: req.body.day,
        from: req.body.from,
        to: req.body.to,
    };

    // Add the new time entry to the location
    location.time.push(time);
    await location.save();

    // Respond with the updated location
    res.status(200).json(location);
});

// Controller for setting a time slot for a location
export const setTimeSlot = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.locationId);

    if (!location) {
        return res.status(404).json({ message: "Location not found" });
    }

    // Generate a random ID for the time slot
    const charset = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let id = "";
    for (let i = 0; i < 10; i++) {
        id += charset[Math.floor(Math.random() * charset.length)];
    }

    const timeId = req.body.time;
    let day = null;

    // Find the day corresponding to the provided time ID
    location.time.forEach(time => {
        if (time.id === timeId) {
            day = time.day;
        }
    });

    if (!day) {
        return res.status(400).json({ message: "Invalid time ID" });
    }

    const timeSlot = {
        id,
        day,
        from: req.body.from,
        to: req.body.to,
        date: Date.now()
    };

    // Add the new time slot to the location
    location.timeSlots.push(timeSlot);
    await location.save();

    // Respond with the updated location
    res.status(200).json(location);
});

// Controller for updating a time slot of a location
export const updateTimeSlot = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.locationId);

    if (!location) {
        return res.status(404).json({ message: "Location not found" });
    }

    const timeSlotId = req.params.timeSlotId;

    // Update the specified time slot
    const updated = location.timeSlots.some(slot => {
        if (slot.id === timeSlotId) {
            slot.from = req.body.from;
            slot.to = req.body.to;
            slot.date = Date.now();
            return true;
        }
        return false;
    });

    if (!updated) {
        return res.status(404).json({ message: "Time slot not found" });
    }

    await location.save();

    // Respond with the updated location
    res.status(200).json(location);
});

// Controller for deleting a time entry
export const deleteTime = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.locationId);

    if (!location) {
        return res.status(404).json({ message: "Location not found" });
    }

    const timeId = req.params.timeId;

    // Remove the corresponding bookings and the time entry
    await Booking.findOneAndDelete({ "time.id": timeId });
    location.time = location.time.filter(time => time.id !== timeId);
    await location.save();

    // Respond with the updated location
    res.status(200).json(location);
});

// Controller for deleting a time slot
export const deleteTimeSlot = asyncHandler(async (req, res) => {
    const location = await Location.findById(req.params.locationId);

    if (!location) {
        return res.status(404).json({ message: "Location not found" });
    }

    const timeSlotId = req.params.timeSlotId;

    // Remove the corresponding bookings and the time slot
    await Booking.findOneAndDelete({ "time.id": timeSlotId });
    location.timeSlots = location.timeSlots.filter(slot => slot.id !== timeSlotId);
    await location.save();

    // Respond with the updated location
    res.status(200).json(location);
});

// Controller for fetching all locations of a specific user
export const getAllLocations = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    // Find all locations associated with the user ID
    const locations = await Location.find({ userId })
        .populate("userId", "-password -wishlist -ChatList -Reservations")
        .sort({ createdAt: -1 });

    // Respond with the retrieved locations
    res.json(locations);
});

// Controller for fetching all locations
export const getLocations = asyncHandler(async (req, res) => {
    // Find all locations
    const locations = await Location.find()
        .populate("user", "-password -wishlist -ChatList -Reservations");

    // Respond with the retrieved locations
    res.json(locations);
});

// Controller for deleting a location by its ID
export const deleteLocation = asyncHandler(async (req, res) => {
    const id = req.params.locationId;

    // Find the location by its ID and delete it
    await Location.findByIdAndDelete(id);

    // Respond with a success message
    res.json({ message: 'Location deleted' });
});

// Schedule a cron job to update timeSlots every day at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        const locations = await Location.find();
        const now = new Date();
        for (const location of locations) {
            location.timeSlots.forEach(slot => {
                const slotDate = new Date(slot.date);
                const oneDayAfter = new Date(slotDate.getTime() + 24 * 60 * 60 * 1000);
                if (now > oneDayAfter) {
                    slot.taken = false;
                }
            });
            await location.save();
        }
        console.log('Updated timeSlots successfully.');
    } catch (error) {
        console.error('Error updating timeSlots:', error);
    }
});

// Schedule a cron job to update the date of timeSlots every day at midnight
cron.schedule('0 0 * * *', async () => {
    try {
        const locations = await Location.find();
        const now = new Date();
        for (const location of locations) {
            location.timeSlots.forEach(slot => {
                const slotDate = new Date(slot.date);
                const twoDaysAfter = new Date(slotDate.getTime() + 2 * 24 * 60 * 60 * 1000);
                if (now > twoDaysAfter) {
                    slot.date = Date.now();
                }
            });
            await location.save();
        }
        console.log('Updated successfully.');
    } catch (error) {
        console.error('Error updating timeSlots:', error);
    }
});
