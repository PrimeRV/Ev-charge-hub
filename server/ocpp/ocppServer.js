import { WebSocketServer } from "ws";
import ChargingSession from "../models/ChargingSession.js";
import { getRate } from "./rateConfig.js";

// Track last heartbeat per chargerId — used by alerts API
export const chargerHeartbeats = {};

export function initOcppServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, handleProtocols: () => "ocpp1.6" });

  console.log("⚡ OCPP WebSocket server running on ws://localhost:5000/ocpp");

  wss.on("connection", (socket, req) => {
  const url = req.url || "";
  const chargerId = url.split("/").filter(Boolean).pop() || "UNKNOWN";

  console.log(`🔌 Charger connected: ${chargerId}`);

  socket.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString());
      await handleOcppMessage(socket, message, chargerId);
    } catch (error) {
      console.error("⚠️ Failed to parse OCPP message:", error.message);
    }
  });

  socket.on("close", () => {
    console.log(`🔌 Charger disconnected: ${chargerId}`);
  });

  socket.on("error", (error) => {
    console.error("⚠️ OCPP socket error:", error.message);
  });
});

async function handleOcppMessage(socket, message, chargerId) {
  if (!Array.isArray(message)) return;

  const messageType = message[0];
  const messageId = message[1];
  const action = message[2];
  const payload = message[3] || {};

  console.log("Message Type:", messageType);
  console.log("Action:", action);

  // ======================================
  // BOOT NOTIFICATION
  // ======================================

  if (messageType === 2 && action === "BootNotification") {
    console.log("🚗 Charger booted:", payload);

    socket.send(
      JSON.stringify([
        3,
        messageId,
        {
          currentTime: new Date().toISOString(),
          interval: 30,
          status: "Accepted",
        },
      ])
    );

    console.log("📤 BootNotification accepted");
    return;
  }

  // ======================================
  // HEARTBEAT
  // ======================================

  if (messageType === 2 && action === "Heartbeat") {
    chargerHeartbeats[chargerId] = new Date();
    socket.send(
      JSON.stringify([3, messageId, { currentTime: new Date().toISOString() }])
    );

    console.log("❤️ Heartbeat response sent");
    return;
  }

  // ======================================
  // STATUS NOTIFICATION
  // ======================================

  if (messageType === 2 && action === "StatusNotification") {
    console.log("⚡ Charger status:", payload);

    if (payload.status === "Charging") {
      await ChargingSession.findOneAndUpdate(
        {
          chargerId,
          connectorId: payload.connectorId,
          status: { $in: ["Preparing", "Charging"] },
        },
        { $set: { status: "Charging" } }
      );
    }

    socket.send(JSON.stringify([3, messageId, {}]));
    return;
  }

  // ======================================
  // START TRANSACTION
  // ======================================

  if (messageType === 2 && action === "StartTransaction") {
    console.log("▶️ Charging transaction started:", payload);

    const transactionId = Date.now();

    const session = await ChargingSession.create({
      chargerId,
      connectorId: payload.connectorId,
      transactionId,
      idTag: payload.idTag,
      status: "Preparing",
      startTime: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      meterStart: Number(payload.meterStart) || 0,
      meterCurrent: Number(payload.meterStart) || 0,
      energyDelivered: 0,
      power: 0,
      cost: 0,
    });

    console.log("💾 Charging session created:", session._id);
    console.log(`⚡ Transaction ID: ${transactionId}`);

    socket.send(
      JSON.stringify([
        3,
        messageId,
        { transactionId, idTagInfo: { status: "Accepted" } },
      ])
    );

    return;
  }

  // ======================================
  // METER VALUES
  // ======================================

  if (messageType === 2 && action === "MeterValues") {
    console.log("🔋 Meter values received:", payload);

    const transactionId = Number(payload.transactionId);
    const meterValues = payload.meterValue;

    if (!transactionId || !Array.isArray(meterValues)) {
      console.log("⚠️ Invalid meter values");
      return;
    }

    const sampledValues = meterValues[0]?.sampledValue || [];

    let currentMeter = null;
    let currentPower = null;

    for (const value of sampledValues) {
      const numericValue = Number(value.value);
      if (value.measurand === "Energy.Active.Import.Register") currentMeter = numericValue;
      if (value.measurand === "Power.Active.Import") currentPower = numericValue;
    }

    const session = await ChargingSession.findOne({ transactionId });

    if (!session) {
      console.log(`⚠️ Session not found: ${transactionId}`);
      return;
    }

    const energyDelivered = currentMeter !== null
      ? (currentMeter - session.meterStart) / 1000
      : 0;

    const cost = energyDelivered * getRate();

    await ChargingSession.findOneAndUpdate(
      { transactionId },
      {
        $set: {
          status: "Charging",
          meterCurrent: currentMeter ?? session.meterCurrent,
          energyDelivered: Number(energyDelivered.toFixed(3)),
          power: currentPower ?? session.power,
          cost: Number(cost.toFixed(2)),
        },
      }
    );

    console.log(`⚡ Energy: ${energyDelivered.toFixed(3)} kWh`);
    console.log(`⚡ Power: ${currentPower ?? 0} kW`);
    console.log(`💰 Cost: ₹${cost.toFixed(2)}`);

    socket.send(JSON.stringify([3, messageId, {}]));
    return;
  }

  // ======================================
  // STOP TRANSACTION
  // ======================================

  if (messageType === 2 && action === "StopTransaction") {
    console.log("⏹️ Charging transaction stopped:", payload);

    const transactionId = Number(payload.transactionId);
    const meterStop = Number(payload.meterStop);

    const session = await ChargingSession.findOne({ transactionId });

    if (session) {
      const energyDelivered = (meterStop - session.meterStart) / 1000;
      const cost = energyDelivered * getRate();

      await ChargingSession.findOneAndUpdate(
        { transactionId },
        {
          $set: {
            status: "Completed",
            endTime: payload.timestamp ? new Date(payload.timestamp) : new Date(),
            meterStop,
            meterCurrent: meterStop,
            energyDelivered: Number(energyDelivered.toFixed(3)),
            cost: Number(cost.toFixed(2)),
            stopReason: payload.reason || "Unknown",
          },
        }
      );

      console.log("💾 Charging session completed");
      console.log(`⚡ Final energy: ${energyDelivered.toFixed(3)} kWh`);
      console.log(`💰 Final cost: ₹${cost.toFixed(2)}`);
    }

    socket.send(
      JSON.stringify([3, messageId, { idTagInfo: { status: "Accepted" } }])
    );

    return;
  }

  console.log(`⚠️ Unhandled OCPP action: ${action}`);
}
}
