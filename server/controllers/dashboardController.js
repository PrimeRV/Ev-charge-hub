import Station from "../models/Station.js";
import ChargingSession from "../models/ChargingSession.js";

export async function getDashboardStats(req, res) {
    try {
        const stations = await Station.find({});

        const totalStations = stations.length;

        const totalConnectors = stations.reduce(
        (total, station) =>
            total + (station.connectors?.length || 0),
        0
        );

        const operationalStations = stations.filter(
        (station) =>
            station.status?.toLowerCase() === "operational"
        ).length;

        const maintenanceStations = stations.filter(
        (station) =>
            station.status?.toLowerCase() === "maintenance"
        ).length;

        const offlineStations = stations.filter(
        (station) =>
            station.status?.toLowerCase() === "offline"
        ).length;

        const activeSessionCount = await ChargingSession.countDocuments({
            status: { $in: ["Preparing", "Charging"] },
        });

        const revenueResult = await ChargingSession.aggregate([
            { $match: { status: "Completed" } },
            { $group: { _id: null, total: { $sum: "$cost" } } },
        ]);

        const totalRevenue = revenueResult[0]?.total ?? 0;

        res.json({
        success: true,

        source: "Open Charge Map + MongoDB",

        data: {
            totalStations,
            totalConnectors,
            operationalStations,
            maintenanceStations,
            offlineStations,

            activeSessions: activeSessionCount,
            revenue: totalRevenue,

            lastUpdated:
            stations.length > 0
                ? new Date(
                    Math.max(
                    ...stations.map(
                        (station) =>
                        new Date(
                            station.sourceUpdatedAt
                        ).getTime()
                    )
                    )
                )
                : null,
        },
        });

    } catch (error) {
        console.error(
        "Dashboard stats error:",
        error
        );

        res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics",
        });
    }
}