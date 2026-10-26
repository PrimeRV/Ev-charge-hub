import dotenv from "dotenv";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import stationRoutes from "./routes/stationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import chargerRoutes from "./routes/chargerRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import authRoutes from "./routes/authRoutes.js";

import { initOcppServer } from "./ocpp/ocppServer.js";

dotenv.config();

process.on("uncaughtException", (err) => {
    console.error("💥 Uncaught Exception:", err.message, err.stack);
});

process.on("unhandledRejection", (reason) => {
    console.error("💥 Unhandled Rejection:", reason);
});

const app = express();

connectDB();

// ================================
// MIDDLEWARE
// ================================

const allowedOrigins = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, Render health checks)
            if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`CORS blocked: ${origin}`));
        },
        credentials: true,
    })
);

// IMPORTANT: JSON middleware MUST come before routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================================
// ROUTES
// ================================

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/chargers", chargerRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/settings", settingsRoutes);

// ================================
// HEALTH CHECK
// ================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "EV ChargeHub API is running 🚗⚡",
    });
});

// ================================
// SERVER
// ================================

const PORT = process.env.PORT || 5000;

const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

initOcppServer(httpServer);

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("SIGTERM received — shutting down gracefully");
    httpServer.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
    });
});