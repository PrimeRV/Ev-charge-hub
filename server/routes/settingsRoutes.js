import express from "express";
import { chargerHeartbeats } from "../ocpp/ocppServer.js";
import { getRate, setRate } from "../ocpp/rateConfig.js";
import ChargingSession from "../models/ChargingSession.js";
import Station from "../models/Station.js";

const router = express.Router();

// GET system settings + live status
router.get("/", async (req, res) => {
  try {
    const now = new Date();

    const [sessionCount, stationCount] = await Promise.all([
      ChargingSession.countDocuments(),
      Station.countDocuments(),
    ]);

    const connectedChargers = Object.entries(chargerHeartbeats).map(([id, lastSeen]) => ({
      chargerId: id,
      lastSeen,
      online: (now - new Date(lastSeen)) < 2 * 60 * 1000,
    }));

    res.json({
      success: true,
      data: {
        rate: getRate(),
        system: {
          apiVersion: "1.0.0",
          nodeVersion: process.version,
          uptime: Math.floor(process.uptime()),
          port: process.env.PORT || 5000,
        },
        stats: {
          totalSessions: sessionCount,
          totalStations: stationCount,
          connectedChargers,
        },
      },
    });
  } catch (error) {
    console.error("Settings GET error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
});

// PUT update rate
router.put("/rate", (req, res) => {
  const { ratePerKwh } = req.body;
  const parsed = Number(ratePerKwh);

  if (isNaN(parsed) || parsed <= 0) {
    return res.status(400).json({ success: false, message: "Invalid rate value" });
  }

  setRate(parsed);
  res.json({ success: true, message: "Rate updated", ratePerKwh: parsed });
});

export default router;
