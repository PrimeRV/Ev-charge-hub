import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
  MapPin,
  Zap,
  CheckCircle2,
  CalendarPlus,
  BatteryCharging,
  Building2,
  Search,
  RefreshCw,
  Navigation,
  Gauge,
  PlugZap,
  AlertCircle,
} from "lucide-react";

function Stations({ setCurrentPage, setSelectedStation }) {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  // ========================================
  // FETCH STATIONS
  // ========================================

  const fetchStations = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await apiFetch("/api/stations");

      if (!response.ok) {
        throw new Error(
          `HTTP error: ${response.status}`
        );
      }

      const result = await response.json();

      if (result.success) {
        setStations(result.data || []);
      } else {
        throw new Error(
          result.message || "Failed to fetch stations"
        );
      }
    } catch (error) {
      console.error(
        "Failed to fetch stations:",
        error
      );

      setError(
        "Unable to load charging stations. Please make sure the server is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    fetchStations();
  }, []);

  // ========================================
  // SEARCH
  // ========================================

  const filteredStations = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return stations;
    }

    return stations.filter((station) => {
      const name =
        station.name?.toLowerCase() || "";

      const address =
        station.address?.toLowerCase() || "";

      const operator =
        station.operator?.toLowerCase() || "";

      const status =
        station.status?.toLowerCase() || "";

      return (
        name.includes(query) ||
        address.includes(query) ||
        operator.includes(query) ||
        status.includes(query)
      );
    });
  }, [stations, search]);

  // ========================================
  // STATS
  // ========================================

  const totalStations = stations.length;

  const totalConnectors = stations.reduce(
    (total, station) =>
      total + (station.connectors?.length || 0),
    0
  );

  const operationalStations = stations.filter(
    (station) =>
      station.status?.toLowerCase() ===
      "operational"
  ).length;

  const operators = new Set(
    stations
      .map((station) => station.operator)
      .filter(Boolean)
  ).size;

  // ========================================
  // BOOK STATION
  // ========================================

  const handleBookStation = (station) => {
    console.log(
      "Selected station for booking:",
      station
    );

    if (setSelectedStation) {
      setSelectedStation(station);
    }

    if (setCurrentPage) {
      setCurrentPage("booking");
    }
  };

  // ========================================
  // CONNECTOR NAME
  // ========================================

  const getConnectorName = (connector) => {
    if (!connector) {
      return "Unknown";
    }

    return (
      connector.ConnectionType?.Title ||
      connector.ConnectionType?.FormalName ||
      "Unknown"
    );
  };

  // ========================================
  // MAX POWER
  // ========================================

  const getMaxPower = (station) => {
    if (!station.connectors?.length) {
      return "N/A";
    }

    const powers = station.connectors
      .map((connector) =>
        Number(connector.PowerKW)
      )
      .filter(
        (power) =>
          !Number.isNaN(power) && power > 0
      );

    if (!powers.length) {
      return "N/A";
    }

    return `${Math.max(...powers)} kW`;
  };

  // ========================================
  // UNIQUE CONNECTOR TYPES
  // ========================================

  const getConnectorTypes = (station) => {
    if (!station.connectors?.length) {
      return [];
    }

    const types = station.connectors
      .map((connector) =>
        getConnectorName(connector)
      )
      .filter(Boolean);

    return [...new Set(types)];
  };

  // ========================================
  // STATUS STYLE
  // ========================================

  const getStatusStyle = (status) => {
    const normalized =
      status?.toLowerCase() || "";

    if (normalized === "operational") {
      return {
        container:
          "border-emerald-400/20 bg-emerald-500/10 text-emerald-400",
        dot: "bg-emerald-400",
      };
    }

    if (
      normalized.includes("partial") ||
      normalized.includes("mixed")
    ) {
      return {
        container:
          "border-amber-400/20 bg-amber-500/10 text-amber-400",
        dot: "bg-amber-400",
      };
    }

    return {
      container:
        "border-slate-500/20 bg-slate-500/10 text-slate-400",
      dot: "bg-slate-400",
    };
  };

  // ========================================
  // LOADING STATE
  // ========================================

  if (loading) {
    return (
      <main className="min-h-screen space-y-5 p-4 sm:p-5 lg:p-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">
            Network
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Charging Stations
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Find EV charging stations and book a
            charging slot.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[82px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#07151f]"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(
            (item) => (
              <div
                key={item}
                className="h-[320px] animate-pulse rounded-2xl border border-white/[0.06] bg-[#07151f]"
              />
            )
          )}
        </div>
      </main>
    );
  }

  // ========================================
  // MAIN
  // ========================================

  return (
    <main className="min-h-screen space-y-5 p-4 sm:p-5 lg:p-6">
      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">
            Network
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
            Charging Stations
          </h2>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Find EV charging stations and book a
            charging slot.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchStations(true)}
          disabled={refreshing}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-[#07151f] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          {refreshing
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </div>

      {/* ========================================
          ERROR
      ======================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-red-400"
          />

          <div>
            <p className="text-sm font-medium text-red-300">
              Something went wrong
            </p>

            <p className="mt-1 text-xs text-red-400/80">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* ========================================
          STATS
      ======================================== */}

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Stations */}

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">
                Total Stations
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {totalStations}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <MapPin
                size={17}
                className="text-emerald-400"
              />
            </div>
          </div>
        </div>

        {/* Connectors */}

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">
                Connectors
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {totalConnectors}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
              <PlugZap
                size={17}
                className="text-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Operators */}

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">
                Operators
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {operators}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10">
              <Building2
                size={17}
                className="text-purple-400"
              />
            </div>
          </div>
        </div>

        {/* Operational */}

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">
                Operational
              </p>

              <p className="mt-1 text-xl font-semibold text-white">
                {operationalStations}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <CheckCircle2
                size={17}
                className="text-emerald-400"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================
          SEARCH
      ======================================== */}

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search station, location or operator..."
          className="w-full rounded-xl border border-white/[0.07] bg-[#07151f] py-3 pl-11 pr-4 text-xs text-white outline-none transition placeholder:text-slate-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/10"
        />
      </div>

      {/* ========================================
          EMPTY SEARCH RESULT
      ======================================== */}

      {filteredStations.length === 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-500/10">
            <Search
              size={20}
              className="text-slate-500"
            />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-white">
            No stations found
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            Try searching with a different station
            name, location or operator.
          </p>
        </div>
      )}

      {/* ========================================
          STATION GRID
      ======================================== */}

      {filteredStations.length > 0 && (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredStations.map((station) => {
            const statusStyle =
              getStatusStyle(
                station.status
              );

            const connectorTypes =
              getConnectorTypes(
                station
              );

            return (
              <article
                key={station._id}
                className="group flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07151f] transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/25 hover:shadow-[0_15px_45px_rgba(16,185,129,0.08)]"
              >
                {/* Card Content */}

                <div className="flex-1 p-4 sm:p-5">
                  {/* Name + Status */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                        <BatteryCharging
                          size={17}
                          className="text-emerald-400"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {station.name ||
                            "Unnamed Charging Station"}
                        </h3>

                        <p className="mt-1 text-[10px] text-slate-600">
                          Station ID:{" "}
                          {station.externalId ||
                            station._id}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[8px] font-medium ${statusStyle.container}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                      />

                      {station.status ||
                        "Unknown"}
                    </span>
                  </div>

                  {/* Address */}

                  <div className="mt-4 flex items-start gap-2">
                    <MapPin
                      size={13}
                      className="mt-0.5 shrink-0 text-slate-500"
                    />

                    <p className="line-clamp-2 text-[10px] leading-4 text-slate-500">
                      {station.address ||
                        "Address not available"}
                    </p>
                  </div>

                  {/* Operator */}

                  <div className="mt-3 flex items-center gap-2">
                    <Building2
                      size={12}
                      className="shrink-0 text-slate-600"
                    />

                    <span className="text-[9px] text-slate-600">
                      Operator
                    </span>

                    <span className="truncate text-[10px] font-medium text-slate-300">
                      {station.operator ||
                        "Unknown Operator"}
                    </span>
                  </div>

                  {/* Stats */}

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/[0.06] bg-[#091b26] p-3">
                      <div className="flex items-center gap-1.5">
                        <Zap
                          size={12}
                          className="text-blue-400"
                        />

                        <span className="text-[9px] text-slate-500">
                          Connectors
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {station.connectors
                          ?.length || 0}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-[#091b26] p-3">
                      <div className="flex items-center gap-1.5">
                        <Gauge
                          size={12}
                          className="text-purple-400"
                        />

                        <span className="text-[9px] text-slate-500">
                          Max Power
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {getMaxPower(
                          station
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Connector Types */}

                  <div className="mt-4">
                    <p className="mb-2 text-[8px] uppercase tracking-wider text-slate-600">
                      Available Connectors
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {connectorTypes.length >
                      0 ? (
                        connectorTypes.map(
                          (
                            type,
                            index
                          ) => (
                            <span
                              key={`${type}-${index}`}
                              className="rounded-md border border-white/[0.06] bg-[#091b26] px-2 py-1 text-[8px] text-slate-400"
                            >
                              {type}
                            </span>
                          )
                        )
                      ) : (
                        <span className="rounded-md border border-white/[0.06] bg-[#091b26] px-2 py-1 text-[8px] text-slate-600">
                          No connector
                          information
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom */}

                <div className="border-t border-white/[0.06] bg-[#06131c] p-3">
                  <div className="mb-2 flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5 text-[8px] text-slate-600">
                      <Navigation
                        size={10}
                      />

                      {station.latitude
                        ? `${Number(
                            station.latitude
                          ).toFixed(
                            4
                          )}, ${Number(
                            station.longitude
                          ).toFixed(4)}`
                        : "Location unavailable"}
                    </div>

                    <span className="text-[8px] uppercase text-slate-700">
                      OCM
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleBookStation(
                        station
                      )
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-xs font-semibold text-black transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_8px_25px_rgba(16,185,129,0.2)] active:scale-[0.98]"
                  >
                    <CalendarPlus
                      size={14}
                    />

                    Book Charging Slot
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* ========================================
          RESULT COUNT
      ======================================== */}

      {filteredStations.length > 0 && (
        <div className="pb-4 text-center text-[10px] text-slate-600">
          Showing{" "}
          <span className="text-slate-400">
            {filteredStations.length}
          </span>{" "}
          of{" "}
          <span className="text-slate-400">
            {stations.length}
          </span>{" "}
          charging stations
        </div>
      )}
    </main>
  );
}

export default Stations;