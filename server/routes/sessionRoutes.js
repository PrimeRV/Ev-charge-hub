import express from "express";

import ChargingSession from "../models/ChargingSession.js";

const router = express.Router();

// ========================================
// GET ACTIVE CHARGING SESSION
// ========================================

router.get("/active", async (req, res) => {
  try {
    const activeSessions = await ChargingSession.find({
      status: { $in: ["Preparing", "Charging"] },
    })
      .sort({ startTime: -1 })
      .lean();

    res.json({
      success: true,
      count: activeSessions.length,
      data: activeSessions,
    });
  } catch (error) {
    console.error("Failed to fetch active sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active sessions",
      error: error.message,
    });
  }
});

// ========================================
// GET RECENT CHARGING SESSIONS
// ========================================

router.get("/recent", async (req, res) => {
  try {
    const sessions =
      await ChargingSession.find()
        .sort({ startTime: -1 })
        .limit(10)
        .lean();

    res.json({
      success: true,
      source: "MongoDB + OCPP",
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error(
      "Failed to fetch recent sessions:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch recent sessions",
      error: error.message,
    });
  }
});

// ========================================
// REVENUE BY DAY (last 10 days)
// ========================================

router.get("/analytics/revenue", async (req, res) => {
  try {
    const days = 10;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await ChargingSession.aggregate([
      { $match: { status: "Completed", endTime: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%d %b", date: "$endTime" } },
          revenue: { $sum: "$cost" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, day: "$_id", revenue: { $round: ["$revenue", 2] } } },
    ]);

    const totalRevenue = result.reduce((sum, d) => sum + d.revenue, 0);

    res.json({ success: true, data: result, totalRevenue: Number(totalRevenue.toFixed(2)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========================================
// UTILIZATION BY DAY (last 7 days)
// ========================================

router.get("/analytics/utilization", async (req, res) => {
  try {
    const days = 7;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const result = await ChargingSession.aggregate([
      { $match: { startTime: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%a", date: "$startTime" } },
          sessions: { $sum: 1 },
          totalEnergy: { $sum: "$energyDelivered" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, day: "$_id", sessions: 1, totalEnergy: { $round: ["$totalEnergy", 2] } } },
    ]);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ========================================
// GET ALL CHARGING SESSIONS
// ========================================

router.get("/", async (req, res) => {
  try {
    const sessions =
      await ChargingSession.find()
        .sort({ createdAt: -1 })
        .lean();

    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    console.error(
      "Failed to fetch charging sessions:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch charging sessions",
      error: error.message,
    });
  }
});

export default router;