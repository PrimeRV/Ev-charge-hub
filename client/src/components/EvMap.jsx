import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    } from "react-leaflet";

    import L from "leaflet";
    import "leaflet/dist/leaflet.css";

    function createMarkerIcon(status) {
    let color = "#64748b";

    if (status === "Operational") {
        color = "#22c55e";
    } else if (status === "Maintenance") {
        color = "#f59e0b";
    } else if (status === "Offline") {
        color = "#ef4444";
    }

    return L.divIcon({
        className: "ev-marker-wrapper",

        html: `
        <div
            class="ev-marker"
            style="--marker-color:${color}"
        >
            <span>⚡</span>
        </div>
        `,

        iconSize: [42, 42],
        iconAnchor: [21, 21],
        popupAnchor: [0, -21],
    });
    }

    /* Move map when search result is selected */
    function MapController({ station }) {
    const map = useMap();

    useEffect(() => {
        if (!station) return;

        map.flyTo(
        [station.latitude, station.longitude],
        15,
        {
            duration: 1,
        }
        );
    }, [station, map]);

    return null;
    }

    function EvMap() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedStation, setSelectedStation] = useState(null);

    useEffect(() => {
        const fetchStations = async () => {
        try {
            const response = await apiFetch("/api/stations");

            const result = await response.json();

            if (result.success) {
            setStations(result.data);
            }

        } catch (error) {
            console.error(
            "Failed to fetch stations:",
            error
            );
        } finally {
            setLoading(false);
        }
        };

        fetchStations();
    }, []);

    const filteredStations = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
        return stations;
        }

        return stations.filter((station) => {
        return (
            station.name
            ?.toLowerCase()
            .includes(query) ||

            station.address
            ?.toLowerCase()
            .includes(query) ||

            station.operator
            ?.toLowerCase()
            .includes(query)
        );
        });
    }, [stations, search]);

    return (
        <div className="relative h-full min-h-[500px]">

        {/* Header */}
        <div className="absolute left-4 right-4 top-4 z-[1000]">

            <div className="rounded-xl border border-white/[0.08] bg-[#07151f]/95 p-3 shadow-xl backdrop-blur-xl">

            <div className="flex items-center justify-between">

                <div>
                <h2 className="text-sm font-semibold text-white">
                    Live Charging Stations
                </h2>

                <p className="mt-0.5 text-[9px] text-slate-500">
                    Real charging locations from Open Charge Map
                </p>
                </div>

                <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-[9px] font-medium text-emerald-400">
                    Live Data
                </span>

                </div>

            </div>

            {/* Search */}
            <div className="mt-3">

                <input
                type="text"
                value={search}
                onChange={(e) =>
                    setSearch(e.target.value)
                }
                placeholder="Search station, area or operator..."
                className="
                    w-full
                    rounded-lg
                    border
                    border-white/[0.08]
                    bg-black/20
                    px-3
                    py-2
                    text-[10px]
                    text-white
                    outline-none
                    placeholder:text-slate-600
                    focus:border-emerald-500/40
                "
                />

            </div>

            {/* Search results */}
            {search && filteredStations.length > 0 && (

                <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-white/[0.06] bg-[#07151f]">

                {filteredStations
                    .slice(0, 6)
                    .map((station) => (

                    <button
                        key={station._id}
                        onClick={() => {
                        setSelectedStation(station);
                        setSearch(station.name);
                        }}
                        className="
                        flex
                        w-full
                        items-center
                        justify-between
                        border-b
                        border-white/[0.04]
                        px-3
                        py-2.5
                        text-left
                        last:border-0
                        hover:bg-white/[0.04]
                        "
                    >

                        <div className="min-w-0">

                        <p className="truncate text-[10px] font-medium text-slate-200">
                            {station.name}
                        </p>

                        <p className="mt-0.5 truncate text-[9px] text-slate-600">
                            {station.address}
                        </p>

                        </div>

                        <span className="ml-3 shrink-0 text-[8px] text-emerald-400">
                        {station.status}
                        </span>

                    </button>

                    ))}

                </div>

            )}

            </div>

        </div>

        {/* Loading */}
        {loading && (

            <div className="absolute inset-0 z-[999] flex items-center justify-center bg-[#07151f]/70 backdrop-blur-sm">

            <div className="rounded-xl border border-white/[0.08] bg-[#07151f] px-5 py-4 text-center">

                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-700 border-t-emerald-400" />

                <p className="mt-2 text-[10px] text-slate-400">
                Loading real charging stations...
                </p>

            </div>

            </div>

        )}

        {/* Map */}
        <MapContainer
            center={[18.5204, 73.8567]}
            zoom={11}
            scrollWheelZoom={true}
            className="ev-map"
        >

            <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapController
            station={selectedStation}
            />

            {filteredStations.map((station) => (

            <Marker
                key={station._id}
                position={[
                station.latitude,
                station.longitude,
                ]}
                icon={createMarkerIcon(
                station.status
                )}
            >

                <Popup>

                <div className="min-w-[210px]">

                    <h3 className="text-sm font-semibold text-slate-900">
                    ⚡ {station.name}
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500">
                    {station.address}
                    </p>

                    <div className="my-3 border-t border-slate-200" />

                    <div className="space-y-2 text-[10px]">

                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                        Operator
                        </span>

                        <strong className="text-slate-800">
                        {station.operator}
                        </strong>
                    </div>

                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                        Status
                        </span>

                        <strong
                        className={
                            station.status ===
                            "Operational"
                            ? "text-green-600"
                            : "text-orange-500"
                        }
                        >
                        {station.status}
                        </strong>
                    </div>

                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                        Latitude
                        </span>

                        <strong className="text-slate-800">
                        {station.latitude.toFixed(5)}
                        </strong>
                    </div>

                    <div className="flex justify-between gap-4">
                        <span className="text-slate-500">
                        Longitude
                        </span>

                        <strong className="text-slate-800">
                        {station.longitude.toFixed(5)}
                        </strong>
                    </div>

                    </div>

                    <div className="mt-3 rounded-lg bg-slate-100 px-2 py-1.5 text-[8px] text-slate-500">
                    Source: {station.source}
                    </div>

                </div>

                </Popup>

            </Marker>

            ))}

        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] flex gap-3 rounded-lg border border-white/[0.08] bg-[#07151f]/95 px-3 py-2 backdrop-blur-xl">

            <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-[9px] text-slate-400">
                Operational
            </span>
            </div>

            <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            <span className="text-[9px] text-slate-400">
                Maintenance
            </span>
            </div>

            <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[9px] text-slate-400">
                Offline
            </span>
            </div>

        </div>

        {/* Station count */}
        <div className="absolute bottom-4 right-4 z-[1000] rounded-lg border border-white/[0.08] bg-[#07151f]/95 px-3 py-2 backdrop-blur-xl">

            <p className="text-[9px] text-slate-500">
            Real stations
            </p>

            <p className="text-sm font-semibold text-white">
            {filteredStations.length}
            </p>

        </div>

        </div>
    );
}

export default EvMap;