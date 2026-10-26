import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = {
  Operational: "#22c55e",
  Maintenance: "#f59e0b",
  Offline:     "#ef4444",
};

function StationStatus() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await apiFetch("/api/dashboard/stats");
        const result = await res.json();
        if (result.success) setStats(result.data);
      } catch (err) {
        console.error("StationStatus fetch error:", err);
      }
    };
    fetch_();
  }, []);

  const total = stats?.totalStations ?? 0;
  const data = [
    { name: "Operational", value: stats?.operationalStations ?? 0, color: COLORS.Operational },
    { name: "Maintenance", value: stats?.maintenanceStations ?? 0, color: COLORS.Maintenance },
    { name: "Offline",     value: stats?.offlineStations ?? 0,     color: COLORS.Offline },
  ].filter((d) => d.value > 0);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Station Status</h3>
        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-400">Live</span>
      </div>

      <div className="mt-4 flex items-center gap-5">
        <div className="relative h-[145px] w-[145px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data.length ? data : [{ name: "None", value: 1, color: "#1e293b" }]}
                dataKey="value" innerRadius={48} outerRadius={65} paddingAngle={2} stroke="none">
                {(data.length ? data : [{ color: "#1e293b" }]).map((item, i) => (
                  <Cell key={i} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-white">{total}</span>
            <span className="text-[9px] text-slate-500">Total</span>
          </div>
        </div>

        <div className="space-y-4">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <div>
                <p className="text-[10px] text-slate-300">{item.name}</p>
                <p className="text-[9px] text-slate-600">
                  {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                </p>
              </div>
            </div>
          ))}
          {data.length === 0 && <p className="text-[10px] text-slate-600">No data yet</p>}
        </div>
      </div>
    </div>
  );
}

export default StationStatus;
