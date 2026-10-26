import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        stationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Station",
        required: true,
        },

        connectorId: {
        type: Number,
        required: true,
        },

        chargerId: {
        type: String,
        default: null,
        },

        bookingDate: {
        type: Date,
        required: true,
        },

        startTime: {
        type: Date,
        required: true,
        },

        endTime: {
        type: Date,
        required: true,
        },

        status: {
        type: String,
        enum: [
            "Pending",
            "Confirmed",
            "Active",
            "Completed",
            "Cancelled",
        ],
        default: "Confirmed",
    },

        userId: {
        type: String,
        default: "DEMO-USER-001",
    },
    },
    {
    timestamps: true,
    }
);

export default mongoose.model("Booking", bookingSchema);