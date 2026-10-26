import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

const COLORS = {
  operational: "#22c55e",
  maintenance: "#f59e0b",
  offline: "#ef4444",
  unknown: "#64748b",
};

function ChargerStatus() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiFetch("/api/dashboard/stats");
        const result = await response.json();
        if (result.success) setStats(result.data);
      } catch (error) {
        console.error("Failed to fetch station status:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  /*
    Real station numbers coming from MongoDB
  */

  const totalStations = stats?.totalStations ?? 0;

  const operational =
    stats?.operationalStations ?? 0;

  const maintenance =
    stats?.maintenanceStations ?? 0;

  const offline =
    stats?.offlineStations ?? 0;

  /*
    Some stations may have a status that isn't
    Operational / Maintenance / Offline.

    We keep those instead of hiding them.
  */

  const unknown = Math.max(
    0,
    totalStations -
      operational -
      maintenance -
      offline
  );

  const data = [
    {
      name: "Operational",
      value: operational,
      color: COLORS.operational,
    },
    {
      name: "Maintenance",
      value: maintenance,
      color: COLORS.maintenance,
    },
    {
      name: "Offline",
      value: offline,
      color: COLORS.offline,
    },
    {
      name: "Unknown",
      value: unknown,
      color: COLORS.unknown,
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">

      {/* Header */}

      <div className="flex items-center justify-between">

        <div>
          <h3 className="text-sm font-semibold text-white">
            Station Status
          </h3>

          <p className="mt-1 text-[10px] text-slate-600">
            Current status from Open Charge Map
          </p>
        </div>

        <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] text-emerald-400">
          Real Data
        </span>

      </div>


      {/* Chart */}

      <div className="mt-5 flex min-h-[210px] items-center">

        {loading ? (

          <div className="flex w-full items-center justify-center">

            <div className="text-[11px] text-slate-500">
              Loading station status...
            </div>

          </div>

        ) : (

          <div className="flex w-full items-center gap-6">

            {/* DONUT */}

            <div className="relative h-[170px] w-[170px] shrink-0">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={76}
                    paddingAngle={2}
                    stroke="none"
                  >

                    {data.map((entry) => (

                      <Cell
                        key={entry.name}
                        fill={entry.color}
                      />

                    ))}

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: "#07151f",
                      border:
                        "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      color: "#fff",
                      fontSize: "10px",
                    }}
                  />

                </PieChart>

              </ResponsiveContainer>


              {/* CENTER */}

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">

                <span className="text-2xl font-semibold text-white">
                  {totalStations}
                </span>

                <span className="text-[9px] text-slate-500">
                  Stations
                </span>

              </div>

            </div>


            {/* LEGEND */}

            <div className="flex-1 space-y-4">

              {data.map((item) => {

                const percentage =
                  totalStations > 0
                    ? Math.round(
                        (item.value /
                          totalStations) *
                          100
                      )
                    : 0;

                return (
                  <div
                    key={item.name}
                    className="flex items-center gap-2"
                  >

                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          item.color,
                      }}
                    />

                    <div>

                      <p className="text-[10px] text-slate-300">
                        {item.name}
                      </p>

                      <p className="text-[9px] text-slate-600">
                        {item.value} (
                        {percentage}
                        %)
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

          </div>

        )}

      </div>


      {/* Source */}

      <div className="mt-3 border-t border-white/[0.05] pt-3">

        <p className="text-[9px] text-slate-600">
          Source: Open Charge Map • MongoDB
        </p>

      </div>

    </div>
  );
}

export default ChargerStatus;