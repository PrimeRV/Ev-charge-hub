import { useCallback, useEffect, useState } from "react";

import StatCard from "../components/StatCard";
import EvMap from "../components/EvMap";
import ChargingActivity from "../components/ChargingActivity";
import ChargerStatus from "../components/ChargerStatus";
import RecentSessions from "../components/RecentSessions";
import RevenueOverview from "../components/RevenueOverview";
import ActiveCharging from "../components/ActiveCharging";
import StationStatus from "../components/StationStatus";
import ChargerUtilization from "../components/ChargerUtilization";
import TopStations from "../components/TopStations";
import QuickActions from "../components/QuickActions";

import { apiFetch } from "../apiFetch.js";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  const [statsLoading, setStatsLoading] =
    useState(true);

  const [activeLoading, setActiveLoading] =
    useState(true);

  const [lastUpdated, setLastUpdated] =
    useState(null);

  // ========================================
  // FETCH DASHBOARD STATS
  // ========================================

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiFetch("/api/dashboard/stats");

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setStats(result.data || null);
        setLastUpdated(
          result.data?.lastUpdated ||
            new Date().toISOString()
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch dashboard stats:",
        error
      );
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ========================================
  // FETCH ACTIVE SESSION
  // ========================================

  const fetchActiveSession = useCallback(
    async () => {
      try {
        const response = await apiFetch("/api/sessions/active");
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
        const result = await response.json();
        if (result.success) {
          // API now returns array — take first for banner
          const sessions = result.data || [];
          setActiveSession(sessions.length > 0 ? sessions[0] : null);
        }
      } catch (error) {
        console.error("Failed to fetch active session:", error);
        setActiveSession(null);
      } finally {
        setActiveLoading(false);
      }
    },
    []
  );

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchStats();
    fetchActiveSession();

    // Dashboard stats refresh every 60 seconds
    const statsInterval = setInterval(
      fetchStats,
      60000
    );

    // Active session refresh every 5 seconds
    const sessionInterval = setInterval(
      fetchActiveSession,
      5000
    );

    return () => {
      clearInterval(statsInterval);
      clearInterval(sessionInterval);
    };
  }, [
    fetchStats,
    fetchActiveSession,
  ]);

  // ========================================
  // ACTIVE SESSION COUNT
  // ========================================

  const activeSessionCount =
    stats?.activeSessions != null
      ? stats.activeSessions
      : activeSession
        ? 1
        : 0;

  // ========================================
  // REVENUE
  // ========================================

  const revenue =
    stats?.revenue != null
      ? stats.revenue
      : null;

  // ========================================
  // LAST UPDATED
  // ========================================

  const displayLastUpdated =
    lastUpdated
      ? new Date(
          lastUpdated
        ).toLocaleString()
      : "Loading...";

  return (
    <main className="space-y-5 p-4 sm:p-5 lg:p-6">

      {/* ========================================
          PAGE INTRO
      ======================================== */}

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">
            Overview
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Charging Network
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Monitor your EV charging network
            in real-time.
          </p>
        </div>

        <div className="hidden text-right sm:block">
          <p className="text-[10px] text-slate-600">
            Last updated
          </p>

          <p className="text-xs text-slate-400">
            {displayLastUpdated}
          </p>
        </div>
      </div>

      {/* ========================================
          STAT CARDS
      ======================================== */}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL STATIONS */}

        <StatCard
          type="stations"
          title="Total Stations"
          value={
            statsLoading
              ? "..."
              : stats?.totalStations ??
                "—"
          }
          subtitle="Open Charge Map"
        />

        {/* TOTAL CONNECTORS */}

        <StatCard
          type="chargers"
          title="Total Connectors"
          value={
            statsLoading
              ? "..."
              : stats?.totalConnectors ??
                "—"
          }
          subtitle="From station data"
        />

        {/* ACTIVE SESSIONS */}

        <StatCard
          type="sessions"
          title="Active Sessions"
          value={
            statsLoading &&
            activeLoading
              ? "..."
              : activeSessionCount
          }
          subtitle={
            activeSessionCount > 0
              ? "Live right now"
              : "No active charging"
          }
        />

        {/* TOTAL REVENUE */}

        <StatCard
          type="revenue"
          title="Total Revenue"
          value={
            statsLoading
              ? "..."
              : revenue != null
                ? `₹${Number(
                    revenue
                  ).toLocaleString(
                    "en-IN"
                  )}`
                : "—"
          }
          subtitle={
            revenue != null
              ? "Current network revenue"
              : "Revenue data unavailable"
          }
        />
      </section>

      {/* ========================================
          ACTIVE SESSION STATUS
      ======================================== */}

      {activeSession && (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <span className="absolute h-9 w-9 animate-ping rounded-xl bg-emerald-400/10" />

              <span className="relative h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
            </div>

            <div>
              <p className="text-xs font-semibold text-white">
                Charging session active
              </p>

              <p className="mt-0.5 text-[9px] text-slate-500">
                {activeSession.chargerId ||
                  "Unknown charger"}{" "}
                • Connector{" "}
                {activeSession.connectorId ??
                  "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[9px]">
            <div>
              <span className="text-slate-600">
                Power
              </span>

              <p className="mt-0.5 font-medium text-emerald-400">
                {(Number(
                  activeSession.power || 0
                ) / 1000).toFixed(1)}{" "}
                kW
              </p>
            </div>

            <div>
              <span className="text-slate-600">
                Energy
              </span>

              <p className="mt-0.5 font-medium text-white">
                {Number(
                  activeSession.energyDelivered ||
                    0
                ).toFixed(2)}{" "}
                kWh
              </p>
            </div>

            <div>
              <span className="text-slate-600">
                Cost
              </span>

              <p className="mt-0.5 font-medium text-white">
                ₹
                {Number(
                  activeSession.cost || 0
                ).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          ACTIVITY + MAP
      ======================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-5
          xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,1fr)]
        "
      >
        {/* LEFT */}

        <div className="space-y-5">
          <ChargingActivity />

          <ChargerStatus />
        </div>

        {/* RIGHT */}

        <div
          className="
            min-h-[500px]
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.06]
            bg-[#07151f]
          "
        >
          <EvMap />
        </div>
      </section>

      {/* ========================================
          LOWER DASHBOARD
      ======================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-5
          xl:grid-cols-[minmax(0,1.65fr)_minmax(360px,1fr)]
        "
      >
        {/* LEFT */}

        <div className="space-y-5">
          <RecentSessions />

          <RevenueOverview />
        </div>

        {/* RIGHT */}

        <ActiveCharging />
      </section>

      {/* ========================================
          PERFORMANCE
      ======================================== */}

      <section
        className="
          grid
          grid-cols-1
          gap-5
          lg:grid-cols-2
          xl:grid-cols-3
        "
      >
        <StationStatus />

        <ChargerUtilization />

        <TopStations />
      </section>

      {/* ========================================
          QUICK ACTIONS
      ======================================== */}

      <section>
        <QuickActions />
      </section>
    </main>
  );
}

export default Dashboard;