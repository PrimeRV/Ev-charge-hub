import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
  CheckCircle2,
  LoaderCircle,
  AlertCircle,
  Database,
  Zap,
  Clock3,
  BatteryCharging,
  IndianRupee,
  RefreshCw,
} from "lucide-react";

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchSessions = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (sessions.length === 0) setLoading(true);

      setError("");

      const response = await apiFetch("/api/sessions/recent");

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to load sessions"
        );
      }

      setSessions(result.data || []);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
      setError("Unable to load charging sessions.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();

    const interval = setInterval(() => {
      fetchSessions();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Charging":
        return {
          className: "bg-blue-500/10 text-blue-400",
          icon: <LoaderCircle size={11} className="animate-spin" />,
        };

      case "Completed":
        return {
          className: "bg-emerald-500/10 text-emerald-400",
          icon: <CheckCircle2 size={11} />,
        };

      case "Preparing":
        return {
          className: "bg-amber-500/10 text-amber-400",
          icon: <LoaderCircle size={11} />,
        };

      case "Suspended":
        return {
          className: "bg-orange-500/10 text-orange-400",
          icon: <Clock3 size={11} />,
        };

      case "Stopped":
        return {
          className: "bg-red-500/10 text-red-400",
          icon: <AlertCircle size={11} />,
        };

      default:
        return {
          className: "bg-slate-500/10 text-slate-400",
          icon: <AlertCircle size={11} />,
        };
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDuration = (startTime, endTime) => {
    if (!startTime) return "N/A";

    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return "N/A";
    }

    const seconds = Math.max(
      0,
      Math.floor(
        (end.getTime() - start.getTime()) / 1000
      )
    );

    const hours = Math.floor(seconds / 3600);

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }

    return `${minutes}m`;
  };

  const totalEnergy = sessions.reduce(
    (total, session) =>
      total + Number(session.energyDelivered || 0),
    0
  );

  const totalCost = sessions.reduce(
    (total, session) =>
      total + Number(session.cost || 0),
    0
  );

  const activeSessions = sessions.filter(
    (session) =>
      session.status === "Charging" ||
      session.status === "Preparing"
  ).length;

  return (
    <main className="space-y-5 p-4 sm:p-5 lg:p-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">
            Network Activity
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Charging Sessions
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Monitor recent EV charging sessions in real-time.
          </p>
        </div>

        <button
          onClick={() => fetchSessions(true)}
          disabled={refreshing}
          className="flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-[#07151f] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500/30 hover:text-white disabled:opacity-50"
        >
          <RefreshCw
            size={13}
            className={refreshing ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-[10px] text-slate-500">
                Total Sessions
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "..." : sessions.length}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Zap
                size={18}
                className="text-blue-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-[10px] text-slate-500">
                Active Sessions
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "..." : activeSessions}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <BatteryCharging
                size={18}
                className="text-emerald-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-[10px] text-slate-500">
                Energy Delivered
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {loading
                  ? "..."
                  : `${totalEnergy.toFixed(2)} kWh`}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
              <Zap
                size={18}
                className="text-purple-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-[10px] text-slate-500">
                Total Cost
              </p>

              <p className="mt-2 text-2xl font-semibold text-white">
                {loading
                  ? "..."
                  : `₹${totalCost.toFixed(2)}`}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <IndianRupee
                size={18}
                className="text-amber-400"
              />
            </div>
          </div>
        </div>

      </section>

      {/* MAIN TABLE */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07151f]">

        {/* TABLE HEADER */}
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <div className="flex items-center gap-2">

              <h3 className="text-sm font-semibold text-white">
                Recent Sessions
              </h3>

              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-[8px] font-medium text-emerald-400">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                LIVE
              </span>

            </div>

            <p className="mt-1 text-[10px] text-slate-600">
              Latest charging activity from MongoDB + OCPP
            </p>
          </div>

          <div className="flex items-center gap-2 text-[9px] text-slate-600">
            <Database size={11} />
            Auto-refresh: 5 sec
          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="flex items-center gap-2 text-xs text-slate-500">

              <LoaderCircle
                size={16}
                className="animate-spin"
              />

              Loading charging sessions...

            </div>

          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="flex min-h-[300px] items-center justify-center">

            <div className="text-center">

              <AlertCircle
                size={28}
                className="mx-auto mb-3 text-red-400"
              />

              <p className="text-sm text-red-400">
                {error}
              </p>

              <button
                onClick={() => fetchSessions(true)}
                className="mt-4 rounded-lg bg-white/5 px-4 py-2 text-xs text-slate-300 hover:bg-white/10"
              >
                Try Again
              </button>

            </div>

          </div>
        )}

        {/* DESKTOP TABLE */}
        {!loading &&
          !error &&
          sessions.length > 0 && (
            <div className="hidden overflow-x-auto md:block">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b border-white/[0.05] text-[10px] text-slate-500">

                    <th className="px-5 py-3 font-medium">
                      Charger
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Transaction
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Start Time
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Duration
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Energy
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Cost
                    </th>

                    <th className="px-5 py-3 font-medium">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {sessions.map((session) => {

                    const status = getStatusStyle(
                      session.status
                    );

                    return (
                      <tr
                        key={
                          session._id ||
                          session.transactionId
                        }
                        className="border-b border-white/[0.035] transition hover:bg-white/[0.02]"
                      >

                        {/* CHARGER */}
                        <td className="px-5 py-4">

                          <p className="text-xs font-medium text-slate-200">
                            {session.chargerId ||
                              "Unknown Charger"}
                          </p>

                          <p className="mt-1 text-[9px] text-slate-600">
                            Connector{" "}
                            {session.connectorId ??
                              "N/A"}
                          </p>

                        </td>

                        {/* TRANSACTION */}
                        <td className="px-5 py-4">

                          <span className="rounded-md bg-white/[0.03] px-2 py-1 font-mono text-[9px] text-slate-400">
                            #{session.transactionId ||
                              "N/A"}
                          </span>

                        </td>

                        {/* START */}
                        <td className="px-5 py-4">

                          <p className="text-[10px] text-slate-400">
                            {formatDate(
                              session.startTime
                            )}
                          </p>

                        </td>

                        {/* DURATION */}
                        <td className="px-5 py-4">

                          <div className="flex items-center gap-1.5">

                            <Clock3
                              size={11}
                              className="text-slate-600"
                            />

                            <p className="text-[10px] text-slate-400">
                              {getDuration(
                                session.startTime,
                                session.endTime
                              )}
                            </p>

                          </div>

                        </td>

                        {/* ENERGY */}
                        <td className="px-5 py-4">

                          <p className="text-[10px] font-medium text-slate-300">
                            {Number(
                              session.energyDelivered ||
                                0
                            ).toFixed(2)}{" "}
                            kWh
                          </p>

                        </td>

                        {/* COST */}
                        <td className="px-5 py-4">

                          <p className="text-[10px] font-medium text-slate-300">
                            ₹
                            {Number(
                              session.cost || 0
                            ).toFixed(2)}
                          </p>

                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[9px] font-medium ${status.className}`}
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

        {/* MOBILE CARDS */}
        {!loading &&
          !error &&
          sessions.length > 0 && (
            <div className="divide-y divide-white/[0.04] md:hidden">

              {sessions.map((session) => {

                const status = getStatusStyle(
                  session.status
                );

                return (
                  <div
                    key={
                      session._id ||
                      session.transactionId
                    }
                    className="space-y-4 p-4"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                            <Zap
                              size={14}
                              className="text-emerald-400"
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-xs font-medium text-white">
                              {session.chargerId ||
                                "Unknown Charger"}
                            </p>

                            <p className="mt-1 font-mono text-[9px] text-slate-600">
                              Transaction #
                              {session.transactionId ||
                                "N/A"}
                            </p>

                          </div>

                        </div>

                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-medium ${status.className}`}
                      >
                        {session.status ||
                          "Unknown"}
                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-2">

                      <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">

                        <p className="text-[8px] text-slate-600">
                          Connector
                        </p>

                        <p className="mt-1 text-[10px] font-medium text-slate-300">
                          {session.connectorId ??
                            "N/A"}
                        </p>

                      </div>

                      <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">

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

                      <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">

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

                      <div className="rounded-xl border border-white/[0.05] bg-black/10 p-3">

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

                    <div className="border-t border-white/[0.04] pt-3">

                      <p className="text-[9px] text-slate-600">
                        Started{" "}
                        {formatDate(
                          session.startTime
                        )}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          sessions.length === 0 && (
            <div className="flex min-h-[300px] items-center justify-center">

              <div className="text-center">

                <Database
                  size={30}
                  className="mx-auto mb-3 text-slate-600"
                />

                <p className="text-sm text-slate-400">
                  No charging sessions yet
                </p>

                <p className="mt-1 text-[10px] text-slate-600">
                  Start an OCPP charging session and
                  it will appear here.
                </p>

              </div>

            </div>
          )}

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-3">

          <div className="flex items-center gap-1.5">

            <Database
              size={10}
              className="text-slate-600"
            />

            <p className="text-[9px] text-slate-600">
              Source: MongoDB • OCPP
            </p>

          </div>

          <p className="text-[9px] text-slate-700">
            {sessions.length} sessions
          </p>

        </div>

      </section>
    </main>
  );
}

export default Sessions;