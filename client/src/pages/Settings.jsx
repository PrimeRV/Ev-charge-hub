import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
  Settings, Server, Zap, Wifi, WifiOff,
  IndianRupee, CheckCircle2, AlertCircle,
  Clock3, Database, RefreshCw, Save,
} from "lucide-react";

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

function formatTime(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function SettingsPage() {
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rateInput, setRateInput] = useState("");
  const [rateSaving, setRateSaving] = useState(false);
  const [rateMsg, setRateMsg]     = useState(null); // { type: "success"|"error", text }

  const fetchSettings = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const res = await apiFetch("/api/settings");
      const result = await res.json();
      if (result.success) {
        setData(result.data);
        setRateInput(String(result.data.rate));
      }
    } catch (err) {
      console.error("Settings fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(() => fetchSettings(true), 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRateSave = async () => {
    const val = Number(rateInput);
    if (isNaN(val) || val <= 0) {
      setRateMsg({ type: "error", text: "Enter a valid positive number." });
      return;
    }
    try {
      setRateSaving(true);
      setRateMsg(null);
      const res = await apiFetch("/api/settings/rate", {
        method: "PUT",
        body: JSON.stringify({ ratePerKwh: val }),
      });
      const result = await res.json();
      if (result.success) {
        setRateMsg({ type: "success", text: `Rate updated to ₹${val}/kWh` });
        fetchSettings(true);
      } else {
        setRateMsg({ type: "error", text: result.message });
      }
    } catch {
      setRateMsg({ type: "error", text: "Failed to update rate." });
    } finally {
      setRateSaving(false);
    }
  };

  return (
    <main className="space-y-5 p-4 sm:p-5 lg:p-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">
            Configuration
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Settings</h2>
          <p className="mt-1 text-xs text-slate-500">
            System configuration and network status.
          </p>
        </div>
        <button
          onClick={() => fetchSettings(true)}
          disabled={refreshing}
          className="flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-[#07151f] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500/30 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        {/* ── RATE CONFIG ── */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
              <IndianRupee size={17} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Charging Rate</h3>
              <p className="mt-0.5 text-[10px] text-slate-500">Cost per kWh applied to all OCPP sessions</p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-medium text-slate-300">
                Rate (₹ per kWh)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">₹</span>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={rateInput}
                    onChange={(e) => { setRateInput(e.target.value); setRateMsg(null); }}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#071923] py-3 pl-7 pr-4 text-sm font-medium text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
                <button
                  onClick={handleRateSave}
                  disabled={rateSaving}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  <Save size={13} />
                  {rateSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {rateMsg && (
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs ${
                rateMsg.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}>
                {rateMsg.type === "success"
                  ? <CheckCircle2 size={13} />
                  : <AlertCircle size={13} />}
                {rateMsg.text}
              </div>
            )}

            <p className="text-[10px] text-slate-600">
              Current rate: <span className="font-medium text-slate-400">₹{loading ? "..." : data?.rate}/kWh</span>
              {" "}— applies to new meter value calculations only.
            </p>
          </div>
        </div>

        {/* ── SYSTEM INFO ── */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
              <Server size={17} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">System Info</h3>
              <p className="mt-0.5 text-[10px] text-slate-500">Backend server and runtime details</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              { label: "API Version",    value: data?.system?.apiVersion ?? "—" },
              { label: "Node.js",        value: data?.system?.nodeVersion ?? "—" },
              { label: "Port",           value: data?.system?.port ? `:${data.system.port}` : "—" },
              { label: "Uptime",         value: data?.system?.uptime != null ? formatUptime(data.system.uptime) : "—", icon: Clock3 },
              { label: "Total Stations", value: loading ? "..." : data?.stats?.totalStations ?? "—", icon: Database },
              { label: "Total Sessions", value: loading ? "..." : data?.stats?.totalSessions ?? "—", icon: Zap },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
                <div className="flex items-center gap-2">
                  {Icon && <Icon size={12} className="text-slate-600" />}
                  <span className="text-[11px] text-slate-400">{label}</span>
                </div>
                <span className="font-mono text-[11px] font-medium text-slate-200">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── OCPP CHARGERS ── */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <Zap size={17} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">OCPP Chargers</h3>
              <p className="mt-0.5 text-[10px] text-slate-500">Connected chargers via WebSocket</p>
            </div>
          </div>

          <div className="mt-5">
            {loading ? (
              <p className="text-[10px] text-slate-600">Loading...</p>
            ) : data?.stats?.connectedChargers?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <WifiOff size={24} className="mb-3 text-slate-600" />
                <p className="text-xs text-slate-400">No chargers have connected yet</p>
                <p className="mt-1 text-[10px] text-slate-600">
                  Run <span className="font-mono text-slate-500">node chargerSimulator.js</span> to connect one.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.stats.connectedChargers.map((c) => (
                  <div key={c.chargerId} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.online ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                        {c.online
                          ? <Wifi size={14} className="text-emerald-400" />
                          : <WifiOff size={14} className="text-red-400" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-200">{c.chargerId}</p>
                        <p className="mt-0.5 text-[9px] text-slate-600">Last seen: {formatTime(c.lastSeen)}</p>
                      </div>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${c.online ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                      {c.online ? "Online" : "Offline"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── ABOUT ── */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10">
              <Settings size={17} className="text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">About</h3>
              <p className="mt-0.5 text-[10px] text-slate-500">Project information</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {[
              { label: "Project",    value: "EV ChargeHub" },
              { label: "Version",    value: "v1.0.0" },
              { label: "Stack",      value: "MERN + OCPP 1.6" },
              { label: "Database",   value: "MongoDB Atlas" },
              { label: "Map",        value: "Leaflet + OpenStreetMap" },
              { label: "Data Source",value: "Open Charge Map (OCM)" },
              { label: "Purpose",    value: "MCA Mini Project" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3">
                <span className="text-[11px] text-slate-400">{label}</span>
                <span className="text-[11px] font-medium text-slate-200">{value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="flex items-center gap-1.5 text-[9px] text-slate-700">
        <Database size={10} />
        Auto-refresh every 15s
      </div>

    </main>
  );
}
