import asyncHandler from "express-async-handler"
import Location from "../models/location.js";

export const createLocation=asyncHandler(async(req,res)=>{
    const { latitude, longitude } = req.body;
    const location = new Location({ userId:req.params.id, latitude, longitude });
    await location.save();
    res.status(201).json(location);
})

export const getAllLocations=asyncHandler(async(req,res)=>{
    const userId = req.params.id;
    const locations = await Location.find({ userId });
    res.json(locations);
})
export const deleteLocation=asyncHandler(async(req,res)=>{
    const id = req.params.id;
    await Location.findByIdAndDelete(id);
    res.json({ message: 'Location deleted' });
})