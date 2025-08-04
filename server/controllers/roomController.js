import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import Booking from "../models/Booking.js";
import {v2 as cloudinary} from "cloudinary";
import mongoose from "mongoose";

// API to create a new room for a hotel
export const createRoom = async (req, res) => {
    try {
        const { roomType, pricePerNight, amenities } = req.body;
        const hotel = await Hotel.findOne({owner: req.auth.userId});

        if (!hotel) 
            return res.json({ success: false, message: "Hotel not found" });
        
        // upload images to cloudinary
        const uploadImages = req.files.map(async (file) => {
            const response = await cloudinary.uploader.upload(file.path);
            return response.secure_url;
        });

        const images = await Promise.all(uploadImages);

        await Room.create({
            hotel: hotel._id,
            roomType,
            pricePerNight: +pricePerNight,
            amenities: JSON.parse(amenities),
            images,
        })
        res.json({ success: true, message: "Room created successfully" })
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}


// API to get all rooms
export const getRooms = async (req, res) => {
    try {
        console.log("=== GET ROOMS API CALLED ===");
        
        // Check database connection
        if (mongoose.connection.readyState !== 1) {
            console.error("❌ Database not connected. Ready state:", mongoose.connection.readyState);
            return res.json({ 
                success: false, 
                message: "Database connection not available" 
            });
        }
        
        console.log("✅ Database connected, fetching rooms...");
        
        const rooms = await Room.find({ isAvailable: true })
            .populate({
                path: 'hotel',
                populate: {
                    path: 'owner',
                    select: 'image'
                }
            })
            .sort({ createdAt: -1 })
            .maxTimeMS(5000); // Set 5 second timeout

        console.log(`✅ Successfully fetched ${rooms.length} rooms`);
        res.json({ success: true, rooms });
        
    } catch (error) {
        console.error("❌ Error in getRooms:", error);
        
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            return res.json({ 
                success: false, 
                message: "Database connection timeout. Please try again." 
            });
        }
        
        res.json({ 
            success: false, 
            message: error.message || "Failed to fetch rooms" 
        });
    }
}


// API to get all rooms for a specific hotel
export const getOwnerRooms = async (req, res) => {
    try {
        const hotelData = await Hotel.findOne({ owner: req.auth.userId });
        const rooms = await Room.find({ hotel: hotelData._id.toString() })
            .populate("hotel");

        res.json({ success: true, rooms });
    } catch (error) {
    res.json({ success: false, message: error.message });
    }

}


// API to toggle availability of a room
export const toggleRoomAvailability = async (req, res) => {
    try {
        const { roomId } = req.body;
        const roomData = await Room.findById(roomId);
        roomData.isAvailable = !roomData.isAvailable;
        await roomData.save();
        res.json({ success: true, message: "Room availability Updated" });
    } catch (error) {
    res.json({ success: false, message: error.message });
    }

}

// API to check room availability for given dates
export const checkAvailability = async (req, res) => {
    try {
        const { roomId, checkInDate, checkOutDate } = req.body;

        if (!roomId || !checkInDate || !checkOutDate) {
            return res.json({ 
                success: false, 
                message: "Room ID, check-in date, and check-out date are required" 
            });
        }

        // Check if the room exists and is available
        const room = await Room.findById(roomId);
        if (!room) {
            return res.json({ 
                success: false, 
                message: "Room not found" 
            });
        }

        if (!room.isAvailable) {
            return res.json({ 
                success: false, 
                message: "Room is not available for booking" 
            });
        }

        // Check for conflicting bookings
        const conflictingBookings = await Booking.find({
            room: roomId,
            status: { $in: ["pending", "confirmed"] },
            $or: [
                // Check-in date falls within existing booking
                {
                    checkInDate: { $lte: new Date(checkInDate) },
                    checkOutDate: { $gt: new Date(checkInDate) }
                },
                // Check-out date falls within existing booking
                {
                    checkInDate: { $lt: new Date(checkOutDate) },
                    checkOutDate: { $gte: new Date(checkOutDate) }
                },
                // New booking completely encompasses existing booking
                {
                    checkInDate: { $gte: new Date(checkInDate) },
                    checkOutDate: { $lte: new Date(checkOutDate) }
                }
            ]
        });

        if (conflictingBookings.length > 0) {
            return res.json({ 
                success: false, 
                message: "Room is not available for the selected dates",
                available: false
            });
        }

        // Calculate number of nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        // Calculate total price
        const totalPrice = room.pricePerNight * nights;

        res.json({ 
            success: true, 
            message: "Room is available for the selected dates",
            available: true,
            room: {
                _id: room._id,
                roomType: room.roomType,
                pricePerNight: room.pricePerNight,
                amenities: room.amenities,
                images: room.images
            },
            bookingDetails: {
                checkInDate: checkInDate,
                checkOutDate: checkOutDate,
                nights: nights,
                totalPrice: totalPrice
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}