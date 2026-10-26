import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
  Receipt,
  Zap,
  IndianRupee,
  BatteryCharging,
  CheckCircle2,
  AlertCircle,
  Clock3,
  LoaderCircle,
  RefreshCw,
  Database,
  CalendarDays,
} from "lucide-react";

const STATUS_COLORS = {
  Completed:  "bg-emerald-500/10 text-emerald-400",
  Confirmed:  "bg-blue-500/10 text-blue-400",
  Charging:   "bg-blue-500/10 text-blue-400",
  Preparing:  "bg-amber-500/10 text-amber-400",
  Pending:    "bg-amber-500/10 text-amber-400",
  Active:     "bg-purple-500/10 text-purple-400",
  Cancelled:  "bg-red-500/10 text-red-400",
  Stopped:    "bg-red-500/10 text-red-400",
  Suspended:  "bg-orange-500/10 text-orange-400",
};

const TYPE_COLORS = {
  Booking:        "bg-indigo-500/10 text-indigo-400",
  ChargingSession: "bg-emerald-500/10 text-emerald-400",
};

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getDuration(start, end) {
  if (!start) return "—";
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  const mins = Math.max(0, Math.floor((e - s) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function Transactions() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");   // All | Booking | ChargingSession
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (data.length === 0) setLoading(true);
      setError("");

      const res = await apiFetch("/api/transactions");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      setData(result.data || []);
      setSummary(result.summary || null);
    } catch (err) {
      setError("Failed to load transactions.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = data.filter((t) => {
    const typeMatch = filter === "All" || t.type === filter;
    const statusMatch = statusFilter === "All" || t.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const allStatuses = ["All", ...new Set(data.map((t) => t.status).filter(Boolean))];

  return (
    <main className="space-y-5 p-4 sm:p-5 lg:p-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">
            Financial Activity
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Transactions</h2>
          <p className="mt-1 text-xs text-slate-500">
            All bookings and charging sessions in one place.
          </p>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-[#07151f] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500/30 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Total Transactions</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "..." : summary?.totalBookings + summary?.totalSessions ?? "—"}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
              <Receipt size={18} className="text-indigo-400" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Active Sessions</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "..." : summary?.activeCount ?? 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <BatteryCharging size={18} className="text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Energy Delivered</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "..." : `${summary?.totalEnergy ?? 0} kWh`}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
              <Zap size={18} className="text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Total Revenue</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "..." : `₹${Number(summary?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <IndianRupee size={18} className="text-amber-400" />
            </div>
          </div>
        </div>

      </section>

      {/* TABLE */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07151f]">

        {/* TABLE HEADER + FILTERS */}
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">All Transactions</h3>
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[9px] text-slate-400">
              {filtered.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Type filter */}
            {["All", "Booking", "ChargingSession"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition ${
                  filter === f
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/[0.04] text-slate-400 hover:text-white"
                }`}
              >
                {f === "ChargingSession" ? "OCPP Sessions" : f}
              </button>
            ))}

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-white/[0.08] bg-[#071923] px-3 py-1.5 text-[10px] text-slate-400 outline-none"
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <LoaderCircle size={16} className="animate-spin" />
              Loading transactions...
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
                onClick={() => fetchData(true)}
                className="mt-4 rounded-lg bg-white/5 px-4 py-2 text-xs text-slate-300 hover:bg-white/10"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* DESKTOP TABLE */}
        {!loading && !error && filtered.length > 0 && (
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.05] text-[10px] text-slate-500">
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Charger / Station</th>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Date & Time</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Energy</th>
                  <th className="px-5 py-3 font-medium">Cost</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn) => (
                  <tr
                    key={txn._id}
                    className="border-b border-white/[0.035] transition hover:bg-white/[0.02]"
                  >
                    {/* TYPE */}
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2 py-1 text-[9px] font-medium ${TYPE_COLORS[txn.type] || "bg-slate-500/10 text-slate-400"}`}>
                        {txn.type === "ChargingSession" ? "OCPP" : "Booking"}
                      </span>
                    </td>

                    {/* CHARGER / STATION */}
                    <td className="px-5 py-4">
                      <p className="text-xs font-medium text-slate-200">
                        {txn.chargerId || txn.stationName || "—"}
                      </p>
                      <p className="mt-0.5 text-[9px] text-slate-600">
                        {txn.stationAddress || (txn.transactionId ? `Txn #${txn.transactionId}` : `Connector ${txn.connectorId ?? "—"}`)}
                      </p>
                    </td>

                    {/* USER */}
                    <td className="px-5 py-4">
                      <p className="font-mono text-[10px] text-slate-400">{txn.userId || "—"}</p>
                    </td>

                    {/* DATE */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={10} className="text-slate-600" />
                        <p className="text-[10px] text-slate-400">{formatDate(txn.startTime)}</p>
                      </div>
                    </td>

                    {/* DURATION */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock3 size={10} className="text-slate-600" />
                        <p className="text-[10px] text-slate-400">{getDuration(txn.startTime, txn.endTime)}</p>
                      </div>
                    </td>

                    {/* ENERGY */}
                    <td className="px-5 py-4">
                      <p className="text-[10px] font-medium text-slate-300">
                        {txn.energyDelivered != null ? `${Number(txn.energyDelivered).toFixed(2)} kWh` : "—"}
                      </p>
                    </td>

                    {/* COST */}
                    <td className="px-5 py-4">
                      <p className="text-[10px] font-medium text-slate-300">
                        {txn.cost != null ? `₹${Number(txn.cost).toFixed(2)}` : "—"}
                      </p>
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-medium ${STATUS_COLORS[txn.status] || "bg-slate-500/10 text-slate-400"}`}>
                        {["Charging", "Preparing", "Active"].includes(txn.status)
                          ? <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
                          : txn.status === "Completed" || txn.status === "Confirmed"
                          ? <CheckCircle2 size={9} />
                          : <AlertCircle size={9} />}
                        {txn.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MOBILE CARDS */}
        {!loading && !error && filtered.length > 0 && (
          <div className="divide-y divide-white/[0.04] md:hidden">
            {filtered.map((txn) => (
              <div key={txn._id} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[8px] font-medium ${TYPE_COLORS[txn.type] || ""}`}>
                        {txn.type === "ChargingSession" ? "OCPP" : "Booking"}
                      </span>
                      <p className="truncate text-xs font-medium text-white">
                        {txn.chargerId || txn.stationName || "—"}
                      </p>
                    </div>
                    <p className="mt-1 text-[9px] text-slate-600">{formatDate(txn.startTime)}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-medium ${STATUS_COLORS[txn.status] || "bg-slate-500/10 text-slate-400"}`}>
                    {txn.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-white/[0.05] bg-black/10 p-2.5">
                    <p className="text-[8px] text-slate-600">Duration</p>
                    <p className="mt-1 text-[10px] font-medium text-slate-300">{getDuration(txn.startTime, txn.endTime)}</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-black/10 p-2.5">
                    <p className="text-[8px] text-slate-600">Energy</p>
                    <p className="mt-1 text-[10px] font-medium text-slate-300">
                      {txn.energyDelivered != null ? `${Number(txn.energyDelivered).toFixed(2)} kWh` : "—"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.05] bg-black/10 p-2.5">
                    <p className="text-[8px] text-slate-600">Cost</p>
                    <p className="mt-1 text-[10px] font-medium text-slate-300">
                      {txn.cost != null ? `₹${Number(txn.cost).toFixed(2)}` : "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <Database size={30} className="mx-auto mb-3 text-slate-600" />
              <p className="text-sm text-slate-400">No transactions found</p>
              <p className="mt-1 text-[10px] text-slate-600">
                Create a booking or run the charger simulator.
              </p>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-3">
          <div className="flex items-center gap-1.5">
            <Database size={10} className="text-slate-600" />
            <p className="text-[9px] text-slate-600">Source: Bookings + OCPP Sessions • Auto-refresh 15s</p>
          </div>
          <p className="text-[9px] text-slate-700">{filtered.length} records</p>
        </div>

      </section>
    </main>
  );
}
