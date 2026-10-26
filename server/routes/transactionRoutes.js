import express from "express";
import Booking from "../models/Booking.js";
import ChargingSession from "../models/ChargingSession.js";

const router = express.Router();

// ========================================
// GET ALL TRANSACTIONS
// Combines Bookings + ChargingSessions
// ========================================

router.get("/", async (req, res) => {
  try {
    const [bookings, sessions] = await Promise.all([
      Booking.find().populate("stationId", "name address").sort({ createdAt: -1 }).lean(),
      ChargingSession.find().sort({ startTime: -1 }).lean(),
    ]);

    const bookingTxns = bookings.map((b) => ({
      _id: b._id,
      type: "Booking",
      userId: b.userId,
      stationName: b.stationId?.name || "Unknown Station",
      stationAddress: b.stationId?.address || "",
      connectorId: b.connectorId,
      chargerId: b.chargerId || null,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
      energyDelivered: null,
      cost: null,
      createdAt: b.createdAt,
    }));

    const sessionTxns = sessions.map((s) => ({
      _id: s._id,
      type: "ChargingSession",
      userId: s.idTag || "OCPP",
      stationName: null,
      stationAddress: null,
      connectorId: s.connectorId,
      chargerId: s.chargerId,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      energyDelivered: s.energyDelivered,
      cost: s.cost,
      transactionId: s.transactionId,
      createdAt: s.startTime,
    }));

    const all = [...bookingTxns, ...sessionTxns].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const totalRevenue = sessions.reduce((sum, s) => sum + (s.cost || 0), 0);
    const totalEnergy = sessions.reduce((sum, s) => sum + (s.energyDelivered || 0), 0);
    const activeCount = sessions.filter((s) => ["Preparing", "Charging"].includes(s.status)).length;

    res.json({
      success: true,
      count: all.length,
      summary: {
        totalBookings: bookings.length,
        totalSessions: sessions.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalEnergy: Number(totalEnergy.toFixed(2)),
        activeCount,
      },
      data: all,
    });
  } catch (error) {
    console.error("Transactions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
});

export default router;
