import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function ChargerUtilization() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await apiFetch("/api/sessions/analytics/utilization");
        const result = await res.json();
        if (result.success) setData(result.data);
      } catch (error) {
        console.error("Failed to fetch utilization:", error);
      } finally {
        setLoading(false);
      }
    };

    fetch_();
    const interval = setInterval(fetch_, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
  const avgSessions = data.length > 0 ? (totalSessions / data.length).toFixed(1) : 0;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-semibold text-white">
            {loading ? "..." : avgSessions}
          </h3>
          <span className="mb-1 text-[10px] text-slate-500">Avg Sessions / Day</span>
        </div>
      </div>

      <div className="mt-1 text-[10px] font-medium text-white">Charger Utilization</div>

      <div className="mt-3 h-[150px]">
        {!loading && data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-600">
            No session data yet for this week.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#ffffff" strokeOpacity={0.04} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 9 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 9 }}
              />
              <Tooltip
                contentStyle={{
                  background: "#07151f",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "10px",
                }}
                formatter={(v) => [v, "Sessions"]}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#4ade80"
                strokeWidth={2}
                fill="url(#utilizationGradient)"
                dot={{ r: 2.5, fill: "#4ade80", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default ChargerUtilization;
