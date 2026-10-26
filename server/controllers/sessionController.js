import ChargingSession from "../models/ChargingSession.js";

export const getActiveSession = async (req, res) => {
  try {
    const session = await ChargingSession.findOne({
      status: "Charging",
    }).sort({
      startTime: -1,
    });

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error(
      "Failed to fetch active session:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch active charging session",
    });
  }
};


export const getRecentSessions = async (req, res) => {
  try {
    const sessions = await ChargingSession.find()
      .sort({
        createdAt: -1,
      })
      .limit(10);

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
      message: "Failed to fetch charging sessions",
    });
  }
};