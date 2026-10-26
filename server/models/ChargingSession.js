import mongoose from "mongoose";

const chargingSessionSchema = new mongoose.Schema(
  {
    chargerId: {
      type: String,
      required: true,
      index: true,
    },

    connectorId: {
      type: Number,
      required: true,
    },

    transactionId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    idTag: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "Preparing",
        "Charging",
        "Suspended",
        "Completed",
        "Stopped",
      ],
      default: "Preparing",
    },

    startTime: {
      type: Date,
    },

    endTime: {
      type: Date,
    },

    meterStart: {
      type: Number,
      default: 0,
    },

    meterCurrent: {
      type: Number,
      default: 0,
    },

    meterStop: {
      type: Number,
    },

    energyDelivered: {
      type: Number,
      default: 0,
    },

    power: {
      type: Number,
      default: 0,
    },

    cost: {
      type: Number,
      default: 0,
    },

    stopReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ChargingSession =
  mongoose.model(
    "ChargingSession",
    chargingSessionSchema
  );

export default ChargingSession;