import express from "express";
import Booking from "../models/Booking.js";

import {
    createBooking,
    getBookings,
    getStationBookings,
    getUserBookings,
    cancelBooking,
} from "../controllers/bookingController.js";

const router = express.Router();

// GET top stations by booking count — must be BEFORE /:id routes
router.get("/top", async (req, res) => {
  try {
    const result = await Booking.aggregate([
      { $group: { _id: "$stationId", bookings: { $sum: 1 } } },
      { $sort: { bookings: -1 } },
      { $limit: 5 },
      { $lookup: { from: "stations", localField: "_id", foreignField: "_id", as: "station" } },
      { $unwind: "$station" },
      { $project: { _id: 0, name: "$station.name", address: "$station.address", bookings: 1 } },
    ]);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new booking
router.post("/", createBooking);

// Get all bookings
router.get("/", getBookings);

// Get bookings for a specific station
router.get("/station/:stationId", getStationBookings);

// Get bookings for a specific user
router.get("/user/:userId", getUserBookings);

// Cancel booking
router.patch("/:id/cancel", cancelBooking);

export default router;
