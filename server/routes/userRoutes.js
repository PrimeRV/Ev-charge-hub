import express from "express";
import User from "../models/User.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// GET all users with their booking count
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "-password").sort({ createdAt: -1 }).lean();

    // Attach booking count per user
    const bookingCounts = await Booking.aggregate([
      { $group: { _id: "$userId", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(bookingCounts.map((b) => [b._id, b.count]));

    const enriched = users.map((u) => ({
      ...u,
      bookingCount: countMap[u._id?.toString()] ?? 0,
    }));

    res.json({
      success: true,
      count: users.length,
      summary: {
        total: users.length,
        admins: users.filter((u) => u.role === "admin").length,
        regularUsers: users.filter((u) => u.role === "user").length,
      },
      data: enriched,
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

export default router;
