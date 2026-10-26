import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import { Trophy, MapPin } from "lucide-react";

function TopStations() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await apiFetch("/api/bookings/top");
        const result = await res.json();
        if (result.success) setStations(result.data);
      } catch (err) {
        console.error("TopStations fetch error:", err);
      }
    };
    fetch_();
  }, []);

  const max = stations[0]?.bookings || 1;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">
      <div className="flex items-center gap-2">
        <Trophy size={16} className="text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Top Stations</h3>
      </div>

      <div className="mt-5 space-y-5">
        {stations.length === 0 ? (
          <p className="text-[10px] text-slate-600">No booking data yet.</p>
        ) : (
          stations.map((station, index) => (
            <div key={station.name}>
              <div className="flex items-center gap-3">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${index === 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.05] text-slate-400"}`}>
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <MapPin size={11} className="shrink-0 text-slate-600" />
                      <span className="truncate text-[10px] font-medium text-slate-200">{station.name}</span>
                    </div>
                    <span className="ml-2 text-[10px] font-semibold text-white">{station.bookings}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
                      style={{ width: `${Math.round((station.bookings / max) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TopStations;
