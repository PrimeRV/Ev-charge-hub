import mongoose from "mongoose";

const stationSchema = new mongoose.Schema(
  {
    externalId: {
      type: Number,
      required: true,
      unique: true,
    },

    name: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      default: "Address not available",
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    operator: {
      type: String,
      default: "Not provided",
    },

    status: {
      type: String,
      default: "Unknown",
    },

    connectors: {
      type: Array,
      default: [],
    },

    source: {
      type: String,
      default: "Open Charge Map",
    },

    sourceUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Station", stationSchema);