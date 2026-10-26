import express from "express";
import Station from "../models/Station.js";
import ChargingSession from "../models/ChargingSession.js";

const router = express.Router();

// GET /api/chargers
// Returns all stations with connector-level status derived from active ChargingSessions
router.get("/", async (req, res) => {
  try {
    const [stations, activeSessions] = await Promise.all([
      Station.find().sort({ name: 1 }).lean(),
      ChargingSession.find({
        status: { $in: ["Preparing", "Charging"] },
      }).lean(),
    ]);

    // Build a lookup: "chargerId:connectorId" -> session
    const sessionMap = {};
    for (const session of activeSessions) {
      const key = `${session.chargerId}:${session.connectorId}`;
      sessionMap[key] = session;
    }

    // Build charger list — one entry per station, with enriched connectors
    const chargers = stations.map((station) => {
      const connectors = (station.connectors || []).map((connector, index) => {
        const connectorId = connector.ID ?? connector.id ?? index + 1;
        // Try to match against any known OCPP chargerId for this station
        // Since OCM stations don't have a chargerId field, we expose raw connector
        // and let the frontend show session data when chargerId is known
        return {
          connectorId,
          type: connector.ConnectionType?.Title || connector.ConnectionType?.FormalName || "Unknown",
          powerKW: connector.PowerKW || null,
          statusType: connector.StatusType?.Title || "Unknown",
          raw: connector,
        };
      });

      return {
        stationId: station._id,
        stationName: station.name,
        address: station.address,
        operator: station.operator,
        status: station.status,
        latitude: station.latitude,
        longitude: station.longitude,
        connectors,
        connectorCount: connectors.length,
      };
    });

    // Also return OCPP chargers (from active + recent sessions) as a separate list
    // so the frontend can show real-time OCPP charger status
    const recentSessions = await ChargingSession.find()
      .sort({ startTime: -1 })
      .limit(100)
      .lean();

    // Unique chargerIds seen in sessions
    const ocppChargerMap = {};
    for (const session of recentSessions) {
      if (!ocppChargerMap[session.chargerId]) {
        ocppChargerMap[session.chargerId] = {
          chargerId: session.chargerId,
          connectors: {},
          lastSeen: session.startTime,
        };
      }
      const charger = ocppChargerMap[session.chargerId];
      if (!charger.connectors[session.connectorId]) {
        charger.connectors[session.connectorId] = {
          connectorId: session.connectorId,
          activeSession: null,
          lastSession: null,
        };
      }
      const conn = charger.connectors[session.connectorId];
      const key = `${session.chargerId}:${session.connectorId}`;
      if (sessionMap[key]) {
        conn.activeSession = sessionMap[key];
      }
      if (!conn.lastSession) {
        conn.lastSession = session;
      }
      if (new Date(session.startTime) > new Date(charger.lastSeen)) {
        charger.lastSeen = session.startTime;
      }
    }

    const ocppChargers = Object.values(ocppChargerMap).map((charger) => ({
      chargerId: charger.chargerId,
      lastSeen: charger.lastSeen,
      connectors: Object.values(charger.connectors).map((conn) => {
        const active = conn.activeSession;
        return {
          connectorId: conn.connectorId,
          status: active
            ? active.status === "Charging" ? "Charging" : "Preparing"
            : "Available",
          power: active ? active.power : 0,
          energyDelivered: active ? active.energyDelivered : 0,
          cost: active ? active.cost : 0,
          activeSession: active || null,
          lastSession: conn.lastSession,
        };
      }),
    }));

    return res.json({
      success: true,
      data: {
        stations: chargers,
        ocppChargers,
        totalStations: chargers.length,
        totalConnectors: chargers.reduce((sum, c) => sum + c.connectorCount, 0),
        activeSessionCount: activeSessions.length,
      },
    });
  } catch (error) {
    console.error("Chargers endpoint error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
