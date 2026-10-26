import express from "express";

import {
    syncStations,
    getStations,
} from "../controllers/stationController.js";

const router = express.Router();

// Get stations from MongoDB
router.get("/", getStations);

// Sync real stations from Open Charge Map → MongoDB
router.post("/sync", syncStations);

export default router;