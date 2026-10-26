import express from "express";
import ChargingSession from "../models/ChargingSession.js";
import Station from "../models/Station.js";
import { chargerHeartbeats } from "../ocpp/ocppServer.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const now = new Date();
    const alerts = [];

    // ----------------------------------------
    // 1. CHARGER OFFLINE — no heartbeat > 2 min
    // ----------------------------------------
    const HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000;
    for (const [chargerId, lastSeen] of Object.entries(chargerHeartbeats)) {
      const diff = now - new Date(lastSeen);
      if (diff > HEARTBEAT_TIMEOUT_MS) {
        alerts.push({
          id: `offline-${chargerId}`,
          severity: "High",
          type: "Charger Offline",
          message: `${chargerId} has not sent a heartbeat in ${Math.round(diff / 60000)} min.`,
          chargerId,
          timestamp: lastSeen,
        });
      }
    }

    // ----------------------------------------
    // 2. STUCK SESSION — Preparing/Charging > 2 hours
    // ----------------------------------------
    const STUCK_MS = 2 * 60 * 60 * 1000;
    const activeSessions = await ChargingSession.find({
      status: { $in: ["Preparing", "Charging"] },
    }).lean();

    for (const s of activeSessions) {
      const diff = now - new Date(s.startTime);
      if (diff > STUCK_MS) {
        alerts.push({
          id: `stuck-${s._id}`,
          severity: "Medium",
          type: "Stuck Session",
          message: `Session on ${s.chargerId} (Connector ${s.connectorId}) has been ${s.status} for ${Math.round(diff / 3600000)}h.`,
          chargerId: s.chargerId,
          timestamp: s.startTime,
        });
      }
    }

    // ----------------------------------------
    // 3. STATION OFFLINE / MAINTENANCE
    // ----------------------------------------
    const offlineStations = await Station.find({
      status: { $in: ["Offline", "Maintenance"] },
    }).lean();

    for (const st of offlineStations) {
      alerts.push({
        id: `station-${st._id}`,
        severity: st.status === "Offline" ? "High" : "Low",
        type: `Station ${st.status}`,
        message: `${st.name} is currently ${st.status}.`,
        stationId: st._id,
        timestamp: st.sourceUpdatedAt || st.updatedAt,
      });
    }

    // ----------------------------------------
    // 4. NETWORK IDLE — no session in 24 hours
    // ----------------------------------------
    const since24h = new Date(now - 24 * 60 * 60 * 1000);
    const recentCount = await ChargingSession.countDocuments({
      startTime: { $gte: since24h },
    });

    if (recentCount === 0) {
      alerts.push({
        id: "idle-network",
        severity: "Low",
        type: "Network Idle",
        message: "No charging sessions have started in the last 24 hours.",
        timestamp: now,
      });
    }

    // Sort: High → Medium → Low, then newest first
    const ORDER = { High: 0, Medium: 1, Low: 2 };
    alerts.sort((a, b) => {
      const sev = ORDER[a.severity] - ORDER[b.severity];
      if (sev !== 0) return sev;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    res.json({
      success: true,
      count: alerts.length,
      summary: {
        high:   alerts.filter((a) => a.severity === "High").length,
        medium: alerts.filter((a) => a.severity === "Medium").length,
        low:    alerts.filter((a) => a.severity === "Low").length,
      },
      data: alerts,
    });
  } catch (error) {
    console.error("Alerts error:", error);
    res.status(500).json({ success: false, message: "Failed to generate alerts" });
  }
});

export default router;
