import Booking from "../models/Booking.js";
import Station from "../models/Station.js";

// ========================================
// CREATE BOOKING
// ========================================

export async function createBooking(req, res) {
    try {
        const {
            stationId,
            connectorId,
            chargerId,
            bookingDate,
            startTime,
            endTime,
            userId,
        } = req.body || {};

        // -----------------------------
        // Validate required fields
        // -----------------------------

        if (
            !stationId ||
            connectorId === undefined ||
            !bookingDate ||
            !startTime ||
            !endTime
        ) {
            return res.status(400).json({
                success: false,
                message: "Missing required booking fields",
                required: [
                    "stationId",
                    "connectorId",
                    "bookingDate",
                    "startTime",
                    "endTime",
                ],
            });
        }

        // -----------------------------
        // Check station exists
        // -----------------------------

        const station = await Station.findById(stationId);

        if (!station) {
            return res.status(404).json({
                success: false,
                message: "Charging station not found",
            });
        }

        // -----------------------------
        // Validate dates
        // -----------------------------

        const start = new Date(startTime);
        const end = new Date(endTime);
        const date = new Date(bookingDate);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            Number.isNaN(date.getTime())
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid booking date or time",
            });
        }

        // End must be after start
        if (end <= start) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time",
            });
        }

        // -----------------------------
        // Check booking conflict
        // -----------------------------

        const conflictingBooking = await Booking.findOne({
            stationId,
            connectorId,

            status: {
                $in: [
                    "Pending",
                    "Confirmed",
                    "Active",
                ],
            },

            startTime: {
                $lt: end,
            },

            endTime: {
                $gt: start,
            },
        });

        if (conflictingBooking) {
            return res.status(409).json({
                success: false,
                message:
                    "This connector is already booked for the selected time.",
            });
        }

        // -----------------------------
        // Create booking
        // -----------------------------

        const booking = await Booking.create({
            stationId,
            connectorId,
            chargerId: chargerId || null,
            bookingDate: date,
            startTime: start,
            endTime: end,
            status: "Confirmed",
            userId: userId || "DEMO-USER-001",
        });

        // -----------------------------
        // Populate station information
        // -----------------------------

        const populatedBooking = await Booking.findById(
            booking._id
        ).populate("stationId");

        // -----------------------------
        // Response
        // -----------------------------

        return res.status(201).json({
            success: true,
            message: "Charging slot booked successfully",
            data: populatedBooking,
        });

    } catch (error) {
        console.error(
            "Create booking error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to create booking",
            error: error.message,
        });
    }
}


// ========================================
// GET ALL BOOKINGS
// ========================================

export async function getBookings(req, res) {
    try {
        const bookings = await Booking.find()
            .populate("stationId")
            .sort({
                startTime: -1,
            });

        return res.json({
            success: true,
            count: bookings.length,
            data: bookings,
        });

    } catch (error) {
        console.error(
            "Get bookings error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
            error: error.message,
        });
    }
}


// ========================================
// GET BOOKINGS FOR A STATION
// ========================================

export async function getStationBookings(req, res) {
    try {
        const { stationId } = req.params;

        if (!stationId) {
            return res.status(400).json({
                success: false,
                message: "Station ID is required",
            });
        }

        const bookings = await Booking.find({
            stationId,
        })
            .populate("stationId")
            .sort({
                startTime: 1,
            });

        return res.json({
            success: true,
            count: bookings.length,
            data: bookings,
        });

    } catch (error) {
        console.error(
            "Get station bookings error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch station bookings",
            error: error.message,
        });
    }
}


// ========================================
// GET BOOKINGS FOR A USER
// ========================================

export async function getUserBookings(req, res) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required",
            });
        }

        const bookings = await Booking.find({
            userId,
        })
            .populate("stationId")
            .sort({
                startTime: -1,
            });

        return res.json({
            success: true,
            count: bookings.length,
            data: bookings,
        });

    } catch (error) {
        console.error(
            "Get user bookings error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch user bookings",
            error: error.message,
        });
    }
}


// ========================================
// GET SINGLE BOOKING
// ========================================

export async function getBookingById(req, res) {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id)
            .populate("stationId");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        return res.json({
            success: true,
            data: booking,
        });

    } catch (error) {
        console.error(
            "Get booking error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch booking",
            error: error.message,
        });
    }
}


// ========================================
// CANCEL BOOKING
// ========================================

export async function cancelBooking(req, res) {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        // Already cancelled
        if (booking.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled",
            });
        }

        // Completed booking
        if (booking.status === "Completed") {
            return res.status(400).json({
                success: false,
                message:
                    "Completed booking cannot be cancelled",
            });
        }

        booking.status = "Cancelled";

        await booking.save();

        return res.json({
            success: true,
            message:
                "Booking cancelled successfully",
            data: booking,
        });

    } catch (error) {
        console.error(
            "Cancel booking error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to cancel booking",
            error: error.message,
        });
    }
}