import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
  CheckCircle2,
  LoaderCircle,
  AlertCircle,
  Database,
} from "lucide-react";

function RecentSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setError("");

        const response = await apiFetch("/api/sessions/recent");

        if (!response.ok) {
          throw new Error(
            `Server returned ${response.status}`
          );
        }

        const result = await response.json();

        console.log("Real charging sessions:", result);

        if (result.success) {
          setSessions(result.data || []);
        } else {
          throw new Error(
            result.message ||
              "Failed to load charging sessions"
          );
        }
      } catch (err) {
        console.error(
          "Failed to fetch charging sessions:",
          err
        );

        setError(
          "Unable to load live charging sessions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();

    // Refresh every 5 seconds
    const interval = setInterval(
      fetchSessions,
      5000
    );

    return () => clearInterval(interval);
  }, []);

  // ========================================
  // STATUS STYLE
  // ========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Charging":
        return {
          className:
            "bg-blue-500/10 text-blue-400",
          icon: <LoaderCircle size={9} />,
        };

      case "Completed":
        return {
          className:
            "bg-emerald-500/10 text-emerald-400",
          icon: <CheckCircle2 size={9} />,
        };

      case "Preparing":
        return {
          className:
            "bg-amber-500/10 text-amber-400",
          icon: <LoaderCircle size={9} />,
        };

      default:
        return {
          className:
            "bg-slate-500/10 text-slate-400",
          icon: <AlertCircle size={9} />,
        };
    }
  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ========================================
  // DURATION
  // ========================================

  const getDuration = (startTime, endTime) => {
    if (!startTime) return "N/A";

    const start = new Date(startTime);

    const end = endTime
      ? new Date(endTime)
      : new Date();

    const seconds = Math.max(
      0,
      Math.floor(
        (end.getTime() - start.getTime()) /
          1000
      )
    );

    const hours = Math.floor(
      seconds / 3600
    );

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07151f]">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">

        <div>

          <div className="flex items-center gap-2">

            <h3 className="text-sm font-semibold text-white">
              Recent Sessions
            </h3>

            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[8px] font-medium text-emerald-400">

              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

              LIVE DATA

            </span>

          </div>

          <p className="mt-1 text-[10px] text-slate-600">
            Latest charging activity from OCPP
          </p>

        </div>

        <button className="text-[11px] font-medium text-emerald-400 transition hover:text-emerald-300">
          View All
        </button>

      </div>


      {/* ========================================
          LOADING
      ======================================== */}

      {loading && (

        <div className="flex min-h-[240px] items-center justify-center">

          <div className="flex items-center gap-2 text-[11px] text-slate-500">

            <LoaderCircle
              size={14}
              className="animate-spin"
            />

            Loading real charging sessions...

          </div>

        </div>

      )}


      {/* ========================================
          ERROR
      ======================================== */}

      {!loading && error && (

        <div className="flex min-h-[240px] items-center justify-center">

          <div className="text-center">

            <AlertCircle
              size={22}
              className="mx-auto mb-2 text-red-400"
            />

            <p className="text-xs text-red-400">
              {error}
            </p>

            <p className="mt-1 text-[9px] text-slate-600">
              Check that the backend is running on port
              5000.
            </p>

          </div>

        </div>

      )}


      {/* ========================================
          DESKTOP TABLE
      ======================================== */}

      {!loading &&
        !error &&
        sessions.length > 0 && (

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b border-white/[0.05] text-[10px] text-slate-500">

                  <th className="px-4 py-3 font-medium">
                    Charger
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Transaction
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Start Time
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Duration
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Energy
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Cost
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {sessions.map((session) => {

                  const status =
                    getStatusStyle(
                      session.status
                    );

                  return (

                    <tr
                      key={
                        session._id ||
                        session.transactionId
                      }
                      className="border-b border-white/[0.035] last:border-0 transition hover:bg-white/[0.02]"
                    >

                      {/* Charger */}

                      <td className="px-4 py-3">

                        <div>

                          <p className="text-[11px] font-medium text-slate-200">
                            {session.chargerId ||
                              "Unknown Charger"}
                          </p>

                          <p className="mt-0.5 text-[9px] text-slate-600">
                            Connector{" "}
                            {session.connectorId ??
                              "N/A"}
                          </p>

                        </div>

                      </td>


                      {/* Transaction */}

                      <td className="px-4 py-3">

                        <p className="font-mono text-[9px] text-slate-500">
                          {session.transactionId ||
                            "N/A"}
                        </p>

                      </td>


                      {/* Start */}

                      <td className="px-4 py-3">

                        <p className="text-[10px] text-slate-500">
                          {formatDate(
                            session.startTime
                          )}
                        </p>

                      </td>


                      {/* Duration */}

                      <td className="px-4 py-3">

                        <p className="text-[10px] text-slate-500">
                          {getDuration(
                            session.startTime,
                            session.endTime
                          )}
                        </p>

                      </td>


                      {/* Energy */}

                      <td className="px-4 py-3">

                        <p className="text-[10px] font-medium text-slate-300">
                          {Number(
                            session.energyDelivered ||
                              0
                          ).toFixed(2)}{" "}
                          kWh
                        </p>

                      </td>


                      {/* Cost */}

                      <td className="px-4 py-3">

                        <p className="text-[10px] font-medium text-slate-300">
                          ₹
                          {Number(
                            session.cost || 0
                          ).toFixed(2)}
                        </p>

                      </td>


                      {/* Status */}

                      <td className="px-4 py-3">

                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-medium ${status.className}`}
                        >

                          {status.icon}

                          {session.status ||
                            "Unknown"}

                        </span>

                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          </div>

        )}


      {/* ========================================
          MOBILE
      ======================================== */}

      {!loading &&
        !error &&
        sessions.length > 0 && (

          <div className="divide-y divide-white/[0.04] md:hidden">

            {sessions.map((session) => {

              const status =
                getStatusStyle(
                  session.status
                );

              return (

                <div
                  key={
                    session._id ||
                    session.transactionId
                  }
                  className="space-y-3 p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="min-w-0">

                      <p className="truncate text-xs font-medium text-white">
                        {session.chargerId ||
                          "Unknown Charger"}
                      </p>

                      <p className="mt-1 font-mono text-[9px] text-slate-600">
                        Transaction:{" "}
                        {session.transactionId ||
                          "N/A"}
                      </p>

                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-medium ${status.className}`}
                    >
                      {session.status ||
                        "Unknown"}
                    </span>

                  </div>


                  <div className="grid grid-cols-3 gap-2">

                    <div>

                      <p className="text-[8px] text-slate-600">
                        Energy
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-slate-300">
                        {Number(
                          session.energyDelivered ||
                            0
                        ).toFixed(2)}{" "}
                        kWh
                      </p>

                    </div>


                    <div>

                      <p className="text-[8px] text-slate-600">
                        Duration
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-slate-300">
                        {getDuration(
                          session.startTime,
                          session.endTime
                        )}
                      </p>

                    </div>


                    <div>

                      <p className="text-[8px] text-slate-600">
                        Cost
                      </p>

                      <p className="mt-1 text-[10px] font-medium text-slate-300">
                        ₹
                        {Number(
                          session.cost || 0
                        ).toFixed(2)}
                      </p>

                    </div>

                  </div>


                  <p className="text-[9px] text-slate-600">
                    {formatDate(
                      session.startTime
                    )}
                  </p>

                </div>

              );
            })}

          </div>

        )}


      {/* ========================================
          EMPTY STATE
      ======================================== */}

      {!loading &&
        !error &&
        sessions.length === 0 && (

          <div className="flex min-h-[220px] items-center justify-center">

            <div className="text-center">

              <Database
                size={24}
                className="mx-auto mb-2 text-slate-600"
              />

              <p className="text-xs text-slate-400">
                No charging sessions available
              </p>

              <p className="mt-1 text-[9px] text-slate-600">
                Start an OCPP charging session to see
                live data here.
              </p>

            </div>

          </div>

        )}


      {/* ========================================
          SOURCE
      ======================================== */}

      <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-3">

        <div className="flex items-center gap-1.5">

          <Database
            size={10}
            className="text-slate-600"
          />

          <p className="text-[9px] text-slate-600">
            Source: OCPP • MongoDB
          </p>

        </div>

        <p className="text-[9px] text-slate-700">
          {sessions.length} sessions
        </p>

      </div>

    </div>
  );
}

export default RecentSessions;