import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
  AlertTriangle, AlertCircle, Info,
  RefreshCw, Bell, CheckCircle2, LoaderCircle, Database,
} from "lucide-react";

const SEVERITY = {
  High:   { color: "bg-red-500/10 text-red-400 border-red-500/20",    icon: AlertCircle,   dot: "bg-red-400" },
  Medium: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: AlertTriangle, dot: "bg-amber-400" },
  Low:    { color: "bg-blue-500/10 text-blue-400 border-blue-500/20",  icon: Info,          dot: "bg-blue-400" },
};

const TYPE_ICONS = {
  "Charger Offline": AlertCircle,
  "Stuck Session":   AlertTriangle,
  "Station Offline": AlertCircle,
  "Station Maintenance": Info,
  "Network Idle":    Info,
};

function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-IN", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function Alerts() {
  const [alerts, setAlerts]     = useState([]);
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]       = useState("");
  const [filter, setFilter]     = useState("All");

  const fetchAlerts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (alerts.length === 0) setLoading(true);
      setError("");

      const res = await apiFetch("/api/alerts");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      setAlerts(result.data || []);
      setSummary(result.summary || null);
    } catch (err) {
      setError("Failed to load alerts.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(() => fetchAlerts(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = filter === "All" ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <main className="space-y-5 p-4 sm:p-5 lg:p-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">
            System Monitoring
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Alerts</h2>
          <p className="mt-1 text-xs text-slate-500">
            Real-time issues detected across the charging network.
          </p>
        </div>

        <button
          onClick={() => fetchAlerts(true)}
          disabled={refreshing}
          className="flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-[#07151f] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500/30 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div className="rounded-2xl border border-red-500/10 bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">High Severity</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "..." : summary?.high ?? 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <AlertCircle size={18} className="text-red-400" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/10 bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Medium Severity</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "..." : summary?.medium ?? 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-500/10 bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Low Severity</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "..." : summary?.low ?? 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Info size={18} className="text-blue-400" />
            </div>
          </div>
        </div>

      </section>

      {/* ALERTS LIST */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07151f]">

        {/* HEADER + FILTER */}
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Bell size={14} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-white">Active Alerts</h3>
            {!loading && alerts.length > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-medium text-red-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                {alerts.length}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {["All", "High", "Medium", "Low"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition ${
                  filter === f
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/[0.04] text-slate-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <LoaderCircle size={16} className="animate-spin" />
              Checking network for alerts...
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <AlertCircle size={28} className="mx-auto mb-3 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => fetchAlerts(true)}
                className="mt-4 rounded-lg bg-white/5 px-4 py-2 text-xs text-slate-300 hover:bg-white/10"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* ALL CLEAR */}
        {!loading && !error && alerts.length === 0 && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/10 bg-emerald-500/5">
                <CheckCircle2 size={28} className="text-emerald-400" />
              </div>
              <p className="text-sm font-medium text-slate-300">All Clear</p>
              <p className="mt-1 text-[10px] text-slate-600">
                No active alerts detected on the network.
              </p>
            </div>
          </div>
        )}

        {/* ALERTS */}
        {!loading && !error && filtered.length > 0 && (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((alert) => {
              const sev = SEVERITY[alert.severity] || SEVERITY.Low;
              const Icon = TYPE_ICONS[alert.type] || Bell;

              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 border-l-2 px-5 py-4 transition hover:bg-white/[0.02] ${sev.color}`}
                >
                  {/* ICON */}
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${sev.color}`}>
                    <Icon size={15} />
                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${sev.color}`}>
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-semibold text-white">{alert.type}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{alert.message}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[9px] text-slate-600">
                      {alert.chargerId && <span>Charger: {alert.chargerId}</span>}
                      {alert.stationId && <span>Station ID: {String(alert.stationId).slice(-6)}</span>}
                      <span>{formatTime(alert.timestamp)}</span>
                    </div>
                  </div>

                  {/* PULSE DOT */}
                  <div className="mt-1 shrink-0">
                    <span className={`block h-2 w-2 animate-pulse rounded-full ${sev.dot}`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EMPTY FILTER */}
        {!loading && !error && alerts.length > 0 && filtered.length === 0 && (
          <div className="flex min-h-[200px] items-center justify-center">
            <p className="text-[10px] text-slate-600">No {filter} severity alerts.</p>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-3">
          <div className="flex items-center gap-1.5">
            <Database size={10} className="text-slate-600" />
            <p className="text-[9px] text-slate-600">
              Source: OCPP Heartbeats + MongoDB • Auto-refresh 15s
            </p>
          </div>
          <p className="text-[9px] text-slate-700">{filtered.length} alerts</p>
        </div>

      </section>
    </main>
  );
}
