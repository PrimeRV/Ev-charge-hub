import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Zap,
  Search,
  RefreshCw,
  BatteryCharging,
  AlertCircle,
  CheckCircle2,
  WifiOff,
  Activity,
  MapPin,
  Building2,
  PlugZap,
  Gauge,
  Clock3,
  IndianRupee,
  Server,
  LoaderCircle,
} from "lucide-react";
import { apiFetch } from "../apiFetch.js";

// ─── helpers ────────────────────────────────────────────────────────────────

function statusStyle(status) {
  switch ((status || "").toLowerCase()) {
    case "charging":
      return {
        dot: "bg-blue-400 animate-pulse",
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        label: "Charging",
      };
    case "preparing":
      return {
        dot: "bg-amber-400 animate-pulse",
        badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        label: "Preparing",
      };
    case "available":
      return {
        dot: "bg-emerald-400",
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        label: "Available",
      };
    case "faulted":
      return {
        dot: "bg-red-400",
        badge: "bg-red-500/10 text-red-400 border-red-500/20",
        label: "Faulted",
      };
    default:
      return {
        dot: "bg-slate-500",
        badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        label: status || "Offline",
      };
  }
}

function formatPower(watts) {
  if (!watts || watts === 0) return "—";
  return `${(watts / 1000).toFixed(1)} kW`;
}

function formatTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

// ─── OCPP Charger Card ───────────────────────────────────────────────────────

function OcppChargerCard({ charger }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#07151f]">
      {/* header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
            <Server size={15} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{charger.chargerId}</p>
            <p className="text-[9px] text-slate-600">OCPP Charger</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[9px] text-emerald-400">Connected</span>
        </div>
      </div>

      {/* connectors */}
      <div className="divide-y divide-white/[0.04]">
        {charger.connectors.map((conn) => {
          const s = statusStyle(conn.status);
          const active = conn.activeSession;
          return (
            <div key={conn.connectorId} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlugZap size={13} className="text-slate-500" />
                  <span className="text-[11px] font-medium text-slate-300">
                    Connector {conn.connectorId}
                  </span>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium ${s.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
              </div>

              {active && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white/[0.02] p-2">
                    <p className="text-[8px] text-slate-600">Power</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-emerald-400">
                      {formatPower(active.power)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/[0.02] p-2">
                    <p className="text-[8px] text-slate-600">Energy</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-white">
                      {Number(active.energyDelivered || 0).toFixed(2)} kWh
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/[0.02] p-2">
                    <p className="text-[8px] text-slate-600">Cost</p>
                    <p className="mt-0.5 text-[11px] font-semibold text-white">
                      ₹{Number(active.cost || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              {!active && conn.lastSession && (
                <p className="mt-1.5 flex items-center gap-1 text-[9px] text-slate-600">
                  <Clock3 size={9} />
                  Last active: {formatTime(conn.lastSession.startTime)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/[0.05] px-4 py-2">
        <p className="text-[9px] text-slate-700">
          Last seen: {formatTime(charger.lastSeen)}
        </p>
      </div>
    </div>
  );
}

// ─── Station Charger Card ────────────────────────────────────────────────────

function StationChargerCard({ station }) {
  const stationStatus = statusStyle(
    station.status?.toLowerCase() === "operational" ? "available" : station.status
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#07151f]">
      {/* header */}
      <div className="border-b border-white/[0.06] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
              <BatteryCharging size={16} className="text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{station.stationName}</p>
              <div className="mt-1 flex items-center gap-1 text-[9px] text-slate-600">
                <MapPin size={9} />
                <span className="truncate">{station.address}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-600">
                <Building2 size={9} />
                <span className="truncate">{station.operator}</span>
              </div>
            </div>
          </div>
          <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-medium ${stationStatus.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${stationStatus.dot}`} />
            {station.status || "Unknown"}
          </span>
        </div>
      </div>

      {/* connectors */}
      <div className="p-4">
        <p className="mb-2 text-[9px] uppercase tracking-wider text-slate-600">
          Connectors ({station.connectorCount})
        </p>
        {station.connectors.length === 0 ? (
          <p className="text-[10px] text-slate-600">No connector data available</p>
        ) : (
          <div className="space-y-2">
            {station.connectors.map((conn) => (
              <div
                key={conn.connectorId}
                className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-[#091b26] px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <PlugZap size={12} className="text-slate-500" />
                  <div>
                    <p className="text-[10px] font-medium text-slate-300">{conn.type}</p>
                    <p className="text-[9px] text-slate-600">ID: {conn.connectorId}</p>
                  </div>
                </div>
                <div className="text-right">
                  {conn.powerKW ? (
                    <p className="text-[10px] font-semibold text-white">{conn.powerKW} kW</p>
                  ) : (
                    <p className="text-[9px] text-slate-600">—</p>
                  )}
                  <p className="text-[9px] text-slate-600">{conn.statusType}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const FILTERS = ["All", "Available", "Charging", "Offline"];

export default function Chargers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [tab, setTab] = useState("ocpp"); // "ocpp" | "stations"

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError("");

      const res = await apiFetch("/api/chargers");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.message);
      setData(result.data);
    } catch (err) {
      setError(err.message || "Failed to load charger data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── filtered OCPP chargers ──
  const filteredOcpp = useMemo(() => {
    if (!data?.ocppChargers) return [];
    return data.ocppChargers.filter((charger) => {
      const q = search.toLowerCase();
      const matchSearch = !q || charger.chargerId.toLowerCase().includes(q);
      const matchFilter =
        filter === "All" ||
        charger.connectors.some((c) =>
          c.status.toLowerCase() === filter.toLowerCase()
        );
      return matchSearch && matchFilter;
    });
  }, [data, search, filter]);

  // ── filtered stations ──
  const filteredStations = useMemo(() => {
    if (!data?.stations) return [];
    return data.stations.filter((s) => {
      const q = search.toLowerCase();
      return (
        !q ||
        s.stationName?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.operator?.toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  // ── summary counts ──
  const summary = useMemo(() => {
    if (!data) return { total: 0, charging: 0, available: 0, offline: 0 };
    let charging = 0, available = 0;
    for (const charger of data.ocppChargers || []) {
      for (const conn of charger.connectors) {
        if (conn.status === "Charging" || conn.status === "Preparing") charging++;
        else if (conn.status === "Available") available++;
      }
    }
    const total = data.ocppChargers?.length || 0;
    return { total, charging, available, offline: total - charging - available };
  }, [data]);

  // ── loading ──
  if (loading) {
    return (
      <main className="min-h-screen p-4 sm:p-5 lg:p-6">
        <div className="mb-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">Infrastructure</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Chargers</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/[0.06] bg-[#07151f]" />
          ))}
        </div>
        <div className="mt-5 flex items-center justify-center py-20">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <LoaderCircle size={16} className="animate-spin" />
            Loading charger data...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen space-y-5 p-4 sm:p-5 lg:p-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">Infrastructure</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Chargers</h2>
          <p className="mt-1 text-xs text-slate-500">
            Real-time OCPP charger status and station connector information.
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-[#07151f] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500/30 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* ── Summary Cards ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "OCPP Chargers", value: summary.total, icon: Server, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Charging Now", value: summary.charging, icon: Zap, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Available", value: summary.available, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Station Connectors", value: data?.totalConnectors ?? 0, icon: PlugZap, color: "text-purple-400", bg: "bg-purple-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500">{label}</p>
                <p className="mt-1.5 text-2xl font-semibold text-white">{value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={18} className={color} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Tabs ── */}
      <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-[#07151f] p-1 w-fit">
        {[
          { id: "ocpp", label: "OCPP Chargers", count: data?.ocppChargers?.length ?? 0 },
          { id: "stations", label: "Station Connectors", count: data?.totalStations ?? 0 },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium transition ${
              tab === t.id
                ? "bg-emerald-500/15 text-emerald-300"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t.label}
            <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${
              tab === t.id ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-500"
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "ocpp" ? "Search charger ID..." : "Search station, address, operator..."}
            className="w-full rounded-xl border border-white/[0.07] bg-[#07151f] py-2.5 pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/40"
          />
        </div>

        {tab === "ocpp" && (
          <div className="flex gap-1.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-xl border px-3 py-2 text-[11px] font-medium transition ${
                  filter === f
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-white/[0.07] bg-[#07151f] text-slate-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── OCPP Tab ── */}
      {tab === "ocpp" && (
        <>
          {filteredOcpp.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#07151f]">
              <WifiOff size={28} className="mb-3 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">
                {data?.ocppChargers?.length === 0
                  ? "No OCPP chargers have connected yet"
                  : "No chargers match your search"}
              </p>
              <p className="mt-1 text-[10px] text-slate-600">
                {data?.ocppChargers?.length === 0
                  ? "Run node testOcpp.js to simulate a charger connection"
                  : "Try a different search or filter"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredOcpp.map((charger) => (
                <OcppChargerCard key={charger.chargerId} charger={charger} />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Stations Tab ── */}
      {tab === "stations" && (
        <>
          {filteredStations.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#07151f]">
              <BatteryCharging size={28} className="mb-3 text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No stations found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredStations.map((station) => (
                <StationChargerCard key={station.stationId} station={station} />
              ))}
            </div>
          )}
          <p className="text-center text-[10px] text-slate-600">
            Showing {filteredStations.length} of {data?.totalStations} stations
          </p>
        </>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between border-t border-white/[0.05] pt-3">
        <div className="flex items-center gap-1.5">
          <Activity size={10} className="text-slate-600" />
          <p className="text-[9px] text-slate-600">Source: OCPP + MongoDB · Auto-refresh: 5s</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-[9px] text-emerald-500/70">Live</span>
        </div>
      </div>

    </main>
  );
}
