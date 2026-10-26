import Station from "../models/Station.js";
import { fetchPuneStations } from "../services/ocmService.js";

export async function syncStations(req, res) {
    try {
        const stations = await fetchPuneStations();

        const operations = stations
        .filter(
            (station) =>
            station.ID &&
            station.AddressInfo?.Latitude &&
            station.AddressInfo?.Longitude
        )
        .map((station) => ({
            updateOne: {
            filter: {
                externalId: station.ID,
            },

            update: {
                externalId: station.ID,

            name:
                station.AddressInfo?.Title ||
                "Unnamed Charging Station",

            address:
                station.AddressInfo?.AddressLine1 ||
                "Address not available",

            latitude:
                station.AddressInfo.Latitude,

            longitude:
                station.AddressInfo.Longitude,

            operator:
                station.OperatorInfo?.Title ||
                "Not provided",

            status:
                station.StatusType?.Title ||
                "Unknown",

            connectors:
                station.Connections || [],

            source: "Open Charge Map",

            sourceUpdatedAt: new Date(),
            },

            upsert: true,
            },
        }));

        if (operations.length > 0) {
            await Station.bulkWrite(operations);
        }

        const savedStations = await Station.find()
            .sort({ name: 1 });

        res.json({
            success: true,

            source: "Open Charge Map",

            count: savedStations.length,

        data: savedStations,
        });

    } catch (error) {
        console.error(
        "Station sync error:",
        error
        );

        res.status(500).json({
        success: false,
        message: "Failed to sync stations",
        error: error.message,
        });
    }
}

export async function getStations(req, res) {
    try {
        const stations = await Station.find()
        .sort({ name: 1 });

        res.json({
        success: true,
        count: stations.length,
        data: stations,
        });

    } catch (error) {

        res.status(500).json({
        success: false,
        message: "Failed to fetch stations",
        error: error.message,
        });

    }
}