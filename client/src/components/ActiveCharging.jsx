import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
  BatteryCharging, Clock3, CircleDollarSign,
  Zap, Wifi, Server, Activity, AlertCircle,
} from "lucide-react";

// Real-time ticking duration — updates every second client-side
function useLiveDuration(startTime) {
  const [duration, setDuration] = useState("00:00:00");

  useEffect(() => {
    if (!startTime) return;
    const tick = () => {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(startTime)) / 1000));
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setDuration(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  return duration;
}

function SessionCard({ session }) {
  const duration = useLiveDuration(session.startTime);
  const isCharging = session.status === "Charging";
  const power = (Number(session.power) || 0) / 1000;
  const energy = Number(session.energyDelivered) || 0;
  const cost = Number(session.cost) || 0;
  const meterCurrent = Number(session.meterCurrent) || Number(session.meterStart) || 0;
  const progress = Math.min(100, Math.max(5, (energy / 10) * 100));

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#091b26] p-4 space-y-4">

      {/* Charger info + status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <Server size={16} className="text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {session.chargerId || "Unknown Charger"}
            </p>
            <p className="text-[9px] text-slate-500">
              Connector {session.connectorId} • Txn #{session.transactionId}
            </p>
          </div>
        </div>
        <span className={`shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-medium ${
          isCharging ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isCharging ? "animate-pulse bg-emerald-400" : "bg-amber-400"}`} />
          {session.status}
        </span>
      </div>

      {/* Power + progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Zap size={12} className="text-yellow-400" fill="currentColor" />
            <span className="text-lg font-semibold text-white">{power.toFixed(1)}</span>
            <span className="text-[10px] text-slate-500">kW</span>
          </div>
          <span className="flex items-center gap-1 text-[8px] text-emerald-500/70">
            <Activity size={9} />
            Live OCPP
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-[8px] text-slate-700">Meter: {Math.round(meterCurrent)} Wh</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-2.5">
          <div className="flex items-center gap-1 text-[8px] text-slate-600">
            <BatteryCharging size={9} /> Energy
          </div>
          <p className="mt-1 text-xs font-semibold text-white">
            {energy.toFixed(2)} <span className="text-[9px] font-normal text-slate-600">kWh</span>
          </p>
        </div>
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-2.5">
          <div className="flex items-center gap-1 text-[8px] text-slate-600">
            <Clock3 size={9} /> Duration
          </div>
          <p className="mt-1 font-mono text-xs font-semibold text-white">{duration}</p>
        </div>
        <div className="rounded-lg border border-white/[0.04] bg-white/[0.015] p-2.5">
          <div className="flex items-center gap-1 text-[8px] text-slate-600">
            <CircleDollarSign size={9} /> Cost
          </div>
          <p className="mt-1 text-xs font-semibold text-white">₹{cost.toFixed(2)}</p>
        </div>
      </div>

    </div>
  );
}

function ActiveCharging() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const fetchSessions = async () => {
    try {
      setError("");
      const res = await apiFetch("/api/sessions/active");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (result.success) setSessions(result.data || []);
      else throw new Error(result.message);
    } catch (err) {
      console.error("Failed to fetch active sessions:", err);
      setError("Unable to connect to the charging server.");
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07151f]">

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-semibold text-white">Active Charging Sessions</h3>
          <p className="mt-0.5 text-[10px] text-slate-600">Live session monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          {sessions.length > 0 && (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
              {sessions.length} active
            </span>
          )}
          <span className="flex items-center gap-1.5 text-[9px] text-slate-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            5s refresh
          </span>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex h-[300px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <BatteryCharging size={24} className="animate-pulse text-emerald-400" />
            <p className="text-xs text-slate-500">Fetching live charging data...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mx-5 mt-4 flex items-center gap-2 rounded-xl border border-red-500/10 bg-red-500/5 px-3 py-2">
          <AlertCircle size={13} className="shrink-0 text-red-400" />
          <p className="text-[9px] text-red-400">{error}</p>
        </div>
      )}

      {/* Sessions list */}
      {!loading && sessions.length > 0 && (
        <div className="space-y-3 p-5">
          {sessions.map((s) => (
            <SessionCard key={s._id} session={s} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && sessions.length === 0 && (
        <div className="flex h-[300px] flex-col items-center justify-center px-5 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <BatteryCharging size={28} className="text-slate-600" />
          </div>
          <h4 className="mt-4 text-sm font-semibold text-slate-300">No Active Sessions</h4>
          <p className="mt-1 text-[10px] text-slate-600">No charger is currently active.</p>
          <div className="mt-4 flex items-center gap-2 rounded-full border border-emerald-500/10 bg-emerald-500/5 px-3 py-1.5">
            <Wifi size={10} className="text-emerald-500" />
            <span className="text-[9px] text-emerald-500">Waiting for OCPP data</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-3">
        <p className="text-[9px] text-slate-700">Source: OCPP + MongoDB</p>
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${sessions.length > 0 ? "animate-pulse bg-emerald-400" : "bg-slate-600"}`} />
          <span className="text-[8px] text-slate-700">
            {sessions.length > 0 ? "Live" : "Standby"}
          </span>
        </div>
      </div>

    </div>
  );
}

export default ActiveCharging;
