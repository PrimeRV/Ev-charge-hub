import WebSocket from "ws";

const CHARGER_ID = "EVCHARGER-001";

const ws = new WebSocket(
  `ws://localhost:5000/${CHARGER_ID}`,
  "ocpp1.6"
);

let messageCounter = 1;
let transactionId = null;
let meterValue = 12500;
let charging = false;


// ========================================
// SEND OCPP MESSAGE
// ========================================

function sendOcpp(action, payload) {
  const messageId = String(messageCounter++);

  const message = [
    2,
    messageId,
    action,
    payload,
  ];

  console.log(
    `\n📤 ${action}`,
    JSON.stringify(payload, null, 2)
  );

  ws.send(JSON.stringify(message));

  return messageId;
}


// ========================================
// CONNECTION OPEN
// ========================================

ws.on("open", () => {

  console.log("\n================================");
  console.log("⚡ EV CHARGER SIMULATOR");
  console.log("================================");

  console.log(`Charger ID: ${CHARGER_ID}`);

  console.log(
    "Connected to OCPP server ✅"
  );


  // Charger introduces itself
  sendOcpp("BootNotification", {

    chargePointVendor: "EV ChargeHub",

    chargePointModel: "Virtual Charger",

    chargePointSerialNumber: CHARGER_ID,

    firmwareVersion: "1.0.0",

  });

});


// ========================================
// RECEIVE OCPP RESPONSE
// ========================================

ws.on("message", (message) => {

  try {

    const response = JSON.parse(
      message.toString()
    );

    console.log(
      "📥 Server response:",
      JSON.stringify(response, null, 2)
    );


    /*
      OCPP CALLRESULT:

      [
        3,
        messageId,
        payload
      ]
    */

    if (response[0] !== 3) {
      return;
    }


    const payload = response[2];


    // ====================================
    // BOOT NOTIFICATION ACCEPTED
    // ====================================

    if (
      payload?.status === "Accepted" &&
      transactionId === null &&
      !charging
    ) {

      console.log(
        "\n✅ Charger accepted by backend"
      );

      startCharging();

      return;
    }


    // ====================================
    // START TRANSACTION RESPONSE
    // ====================================

    if (
      payload?.transactionId !== undefined &&
      transactionId === null
    ) {

      transactionId =
        payload.transactionId;

      console.log(
        `\n⚡ Transaction started: ${transactionId}`
      );


      charging = true;


      sendOcpp(
        "StatusNotification",
        {
          connectorId: 1,

          status: "Charging",

          errorCode: "NoError",
        }
      );

      return;
    }

  } catch (error) {

    console.error(
      "❌ Invalid server response:",
      error.message
    );

  }

});


// ========================================
// START CHARGING
// ========================================

function startCharging() {

  console.log(
    "\n🔌 Starting charging session..."
  );


  sendOcpp(
    "StatusNotification",
    {
      connectorId: 1,

      status: "Preparing",

      errorCode: "NoError",
    }
  );


  setTimeout(() => {

    sendOcpp(
      "StartTransaction",
      {

        connectorId: 1,

        idTag: "EVCHARGE-USER-001",

        meterStart: meterValue,

        timestamp:
          new Date().toISOString(),

      }
    );

  }, 2000);

}


// ========================================
// HEARTBEAT
// ========================================

setInterval(() => {

  if (
    ws.readyState !== WebSocket.OPEN
  ) {
    return;
  }

  sendOcpp(
    "Heartbeat",
    {}
  );

}, 30000);


// ========================================
// METER VALUES
// ========================================

setInterval(() => {

  if (
    !charging ||
    transactionId === null ||
    ws.readyState !== WebSocket.OPEN
  ) {
    return;
  }


  // Increase energy meter
  meterValue += 150;


  sendOcpp(
    "MeterValues",
    {

      connectorId: 1,

      transactionId,

      meterValue: [

        {

          timestamp:
            new Date().toISOString(),

          sampledValue: [

            {
              value:
                String(meterValue),

              measurand:
                "Energy.Active.Import.Register",

              unit: "Wh",
            },


            {
              value: "42.5",

              measurand:
                "Power.Active.Import",

              unit: "kW",
            },

          ],

        },

      ],

    }
  );

}, 5000);


// ========================================
// STOP TRANSACTION
// ========================================

setTimeout(() => {

  if (
    !charging ||
    transactionId === null ||
    ws.readyState !== WebSocket.OPEN
  ) {
    return;
  }


  console.log(
    "\n⏹️ Stopping charging session..."
  );


  sendOcpp(
    "StopTransaction",
    {

      transactionId,

      meterStop: meterValue,

      timestamp:
        new Date().toISOString(),

      reason: "Local",

    }
  );


  charging = false;


  console.log(
    "✅ Charging session stopped"
  );

}, 60000);


// ========================================
// CONNECTION CLOSED
// ========================================

ws.on("close", () => {

  console.log(
    "\n🔌 Charger disconnected"
  );

});


// ========================================
// CONNECTION ERROR
// ========================================

ws.on("error", (error) => {

  console.error(
    "\n❌ Charger error:",
    error.message
  );

});