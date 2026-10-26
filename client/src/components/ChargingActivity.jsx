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

function ChargingActivity() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiFetch("/api/sessions/analytics/utilization");
        const result = await res.json();
        if (result.success && result.data.length > 0) {
          setData(result.data.map((d) => ({ day: d.day, value: d.sessions })));
        }
      } catch (err) {
        console.error("Failed to fetch utilization:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Charging Activity Overview
          </h3>
          <p className="mt-1 text-[10px] text-slate-600">
            Sessions per day (last 7 days)
          </p>
        </div>
      </div>

      <div className="mt-4 h-[250px]">
        {!loading && data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-600">
            No session data yet. Run the charger simulator to see activity here.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="#ffffff" strokeOpacity={0.05} vertical={false} />

              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
                allowDecimals={false}
              />

              <Tooltip
                contentStyle={{
                  background: "#07151f",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "11px",
                }}
                formatter={(v) => [v, "Sessions"]}
              />

              <Area
                type="monotone"
                dataKey="value"
                stroke="#4ade80"
                strokeWidth={2.5}
                fill="url(#activityGradient)"
                dot={{ r: 3, fill: "#4ade80", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default ChargingActivity;
