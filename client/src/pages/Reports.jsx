import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import {
  BarChart3, IndianRupee, Zap, BatteryCharging,
  TrendingUp, RefreshCw, Database,
} from "lucide-react";

const TOOLTIP_STYLE = {
  background: "#07151f",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: "10px",
  color: "#fff",
  fontSize: "10px",
};

const PIE_COLORS = {
  Operational: "#22c55e",
  Maintenance: "#f59e0b",
  Offline:     "#ef4444",
};

export default function Reports() {
  const [revenue, setRevenue]         = useState({ data: [], total: 0 });
  const [utilization, setUtilization] = useState([]);
  const [dashStats, setDashStats]     = useState(null);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const fetchAll = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const [revRes, utilRes, dashRes] = await Promise.all([
        apiFetch("/api/sessions/analytics/revenue"),
        apiFetch("/api/sessions/analytics/utilization"),
        apiFetch("/api/dashboard/stats"),
      ]);

      const [revData, utilData, dashData] = await Promise.all([
        revRes.json(), utilRes.json(), dashRes.json(),
      ]);

      if (revData.success)  setRevenue({ data: revData.data, total: revData.totalRevenue });
      if (utilData.success) setUtilization(utilData.data);
      if (dashData.success) setDashStats(dashData.data);
    } catch (err) {
      console.error("Reports fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => fetchAll(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const totalSessions  = utilization.reduce((s, d) => s + d.sessions, 0);
  const totalEnergy    = utilization.reduce((s, d) => s + (d.totalEnergy || 0), 0);
  const avgSessionsDay = utilization.length > 0 ? (totalSessions / utilization.length).toFixed(1) : 0;

  const pieData = [
    { name: "Operational", value: dashStats?.operationalStations ?? 0 },
    { name: "Maintenance", value: dashStats?.maintenanceStations ?? 0 },
    { name: "Offline",     value: dashStats?.offlineStations ?? 0 },
  ].filter((d) => d.value > 0);

  const kpis = [
    { label: "Total Revenue",    value: loading ? "..." : `₹${Number(revenue.total).toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-amber-400",   bg: "bg-amber-500/10" },
    { label: "Total Sessions",   value: loading ? "..." : totalSessions,                                        icon: BatteryCharging, color: "text-blue-400",  bg: "bg-blue-500/10" },
    { label: "Energy Delivered", value: loading ? "..." : `${totalEnergy.toFixed(1)} kWh`,                     icon: Zap,          color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Avg Sessions/Day", value: loading ? "..." : avgSessionsDay,                                       icon: TrendingUp,   color: "text-emerald-400",bg: "bg-emerald-500/10" },
  ];

  return (
    <main className="space-y-5 p-4 sm:p-5 lg:p-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">Analytics</p>
          <h2 className="mt-1 text-xl font-semibold text-white">Reports</h2>
          <p className="mt-1 text-xs text-slate-500">Network performance and revenue analytics.</p>
        </div>
        <button
          onClick={() => fetchAll(true)}
          disabled={refreshing}
          className="flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-[#07151f] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500/30 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* KPI CARDS */}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-500">{kpi.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{kpi.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.bg}`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* REVENUE CHART */}
      <section className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Revenue — Last 10 Days</h3>
            <p className="mt-1 text-[10px] text-slate-600">Daily revenue from completed charging sessions</p>
          </div>
          <div className="flex items-center gap-1.5">
            <BarChart3 size={14} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400">₹{Number(revenue.total).toLocaleString("en-IN")} total</span>
          </div>
        </div>

        <div className="mt-5 h-[220px]">
          {!loading && revenue.data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-[10px] text-slate-600">
              No revenue data yet. Complete a charging session to see data here.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue.data}>
                <CartesianGrid vertical={false} stroke="#ffffff" strokeOpacity={0.04} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9 }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`₹${v}`, "Revenue"]} cursor={{ fill: "rgba(255,255,255,.03)" }} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* UTILIZATION + STATION PIE */}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">

        {/* UTILIZATION CHART */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">
          <div>
            <h3 className="text-sm font-semibold text-white">Session Utilization — Last 7 Days</h3>
            <p className="mt-1 text-[10px] text-slate-600">Number of charging sessions per day</p>
          </div>

          <div className="mt-5 h-[220px]">
            {!loading && utilization.length === 0 ? (
              <div className="flex h-full items-center justify-center text-[10px] text-slate-600">
                No session data yet for this week.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={utilization}>
                  <defs>
                    <linearGradient id="reportUtilGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#ffffff" strokeOpacity={0.04} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 9 }} allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [v, "Sessions"]} />
                  <Area type="monotone" dataKey="sessions" stroke="#4ade80" strokeWidth={2.5}
                    fill="url(#reportUtilGrad)" dot={{ r: 3, fill: "#4ade80", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* STATION BREAKDOWN PIE */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">
          <h3 className="text-sm font-semibold text-white">Station Breakdown</h3>
          <p className="mt-1 text-[10px] text-slate-600">Current status of all stations</p>

          <div className="mt-5 flex items-center gap-6">
            <div className="relative h-[160px] w-[160px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.length ? pieData : [{ name: "None", value: 1 }]}
                    dataKey="value" cx="50%" cy="50%"
                    innerRadius={52} outerRadius={72} paddingAngle={2} stroke="none"
                  >
                    {(pieData.length ? pieData : [{ name: "None" }]).map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[entry.name] || "#1e293b"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-semibold text-white">{dashStats?.totalStations ?? 0}</span>
                <span className="text-[9px] text-slate-500">Stations</span>
              </div>
            </div>

            <div className="space-y-4">
              {Object.entries(PIE_COLORS).map(([name, color]) => {
                const val = pieData.find((d) => d.name === name)?.value ?? 0;
                const total = dashStats?.totalStations || 1;
                return (
                  <div key={name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                    <div>
                      <p className="text-[10px] text-slate-300">{name}</p>
                      <p className="text-[9px] text-slate-600">{val} ({Math.round((val / total) * 100)}%)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Extra stats */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-4">
            <div>
              <p className="text-[9px] text-slate-600">Total Connectors</p>
              <p className="mt-1 text-sm font-semibold text-white">{dashStats?.totalConnectors ?? "—"}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-600">Active Sessions</p>
              <p className="mt-1 text-sm font-semibold text-white">{dashStats?.activeSessions ?? "—"}</p>
            </div>
          </div>
        </div>

      </section>

      {/* FOOTER */}
      <div className="flex items-center gap-1.5 text-[9px] text-slate-700">
        <Database size={10} />
        Source: MongoDB • OCPP • Auto-refresh 30s
      </div>

    </main>
  );
}
