import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

function RevenueOverview() {
  const [data, setData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await apiFetch("/api/sessions/analytics/revenue");
        const result = await res.json();
        if (result.success) {
          setData(result.data);
          setTotalRevenue(result.totalRevenue);
        }
      } catch (error) {
        console.error("Failed to fetch revenue:", error);
      } finally {
        setLoading(false);
      }
    };

    fetch_();
    const interval = setInterval(fetch_, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Revenue Overview</h3>
          <p className="mt-1 text-[10px] text-slate-600">Last 10 days charging revenue</p>
        </div>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <span className="text-2xl font-semibold text-white">
          {loading ? "..." : `₹${Number(totalRevenue ?? 0).toLocaleString("en-IN")}`}
        </span>
        <span className="mb-1 text-[9px] text-slate-600">Total revenue</span>
      </div>

      <div className="mt-3 h-[190px]">
        {!loading && data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-600">
            No revenue data yet. Complete a charging session to see data here.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
                tickFormatter={(v) => `₹${v}`}
              />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,.03)" }}
                contentStyle={{
                  background: "#07151f",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "10px",
                }}
                formatter={(v) => [`₹${v}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={15} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

export default RevenueOverview;
