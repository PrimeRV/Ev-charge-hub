import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import { useAuth } from "../AuthContext.jsx";

import {
  Zap,
  MapPin,
  CalendarDays,
  Clock3,
  CheckCircle2,
  AlertCircle,
  PlugZap,
  ArrowRight,
  Loader2,
  ChevronDown,
  X,
} from "lucide-react";

const API_URL = "/api";

// ========================================
// TIME OPTIONS
// ========================================

const generateTimeOptions = () => {
  const options = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const value = `${String(hour).padStart(
        2,
        "0"
      )}:${String(minute).padStart(2, "0")}`;

      const displayHour =
        hour === 0
          ? 12
          : hour > 12
          ? hour - 12
          : hour;

      const period = hour >= 12 ? "PM" : "AM";

      const label = `${String(
        displayHour
      ).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")} ${period}`;

      options.push({
        value,
        label,
      });
    }
  }

  return options;
};

const TIME_OPTIONS = generateTimeOptions();

// ========================================
// HELPERS
// ========================================

const getTodayString = () => {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getEndTime = (startTime) => {
  if (!startTime) {
    return "";
  }

  const [hour, minute] =
    startTime.split(":").map(Number);

  const totalMinutes =
    hour * 60 + minute + 60;

  if (totalMinutes >= 24 * 60) {
    return "23:30";
  }

  const endHour = Math.floor(
    totalMinutes / 60
  );

  const endMinute =
    totalMinutes % 60;

  return `${String(endHour).padStart(
    2,
    "0"
  )}:${String(endMinute).padStart(
    2,
    "0")}`;
};

const formatDateForDisplay = (date) => {
  if (!date) {
    return "";
  }

  const [year, month, day] =
    date.split("-");

  return `${day}-${month}-${year}`;
};

const getDateTime = (date, time) => {
  if (!date || !time) {
    return null;
  }

  return new Date(
    `${date}T${time}:00`
  );
};

const formatTime = (time) => {
  if (!time) {
    return "--:--";
  }

  const option = TIME_OPTIONS.find(
    (item) => item.value === time
  );

  return option?.label || time;
};

const calculateDuration = (
  startTime,
  endTime
) => {
  if (!startTime || !endTime) {
    return null;
  }

  const [startHour, startMinute] =
    startTime.split(":").map(Number);

  const [endHour, endMinute] =
    endTime.split(":").map(Number);

  let startMinutes =
    startHour * 60 + startMinute;

  let endMinutes =
    endHour * 60 + endMinute;

  if (endMinutes <= startMinutes) {
    endMinutes += 24 * 60;
  }

  const difference =
    endMinutes - startMinutes;

  const hours = Math.floor(
    difference / 60
  );

  const minutes = difference % 60;

  return {
    hours,
    minutes,
    totalMinutes: difference,
  };
};

// ========================================
// TIME SELECT
// ========================================

function TimeSelect({
  label,
  value,
  onChange,
  minTime,
}) {
  const availableOptions =
    useMemo(() => {
      if (!minTime) {
        return TIME_OPTIONS;
      }

      const [minHour, minMinute] =
        minTime.split(":").map(Number);

      const minTotal =
        minHour * 60 + minMinute;

      return TIME_OPTIONS.filter(
        (option) => {
          const [hour, minute] =
            option.value
              .split(":")
              .map(Number);

          const total =
            hour * 60 + minute;

          return total > minTotal;
        }
      );
    }, [minTime]);

  return (
    <div className="flex-1">
      <label className="mb-2 flex items-center gap-2 text-[11px] font-medium text-slate-300">
        <Clock3
          size={13}
          className="text-emerald-400"
        />

        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#071923] px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
        >
          <option value="">
            Select time
          </option>

          {availableOptions.map(
            (option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            )
          )}
        </select>

        <ChevronDown
          size={15}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>
    </div>
  );
}

// ========================================
// BOOKING PAGE
// ========================================

function Booking({
  selectedStation = null,
}) {
  const { user } = useAuth();
  const [stations, setStations] =
    useState([]);

  const [station, setStation] =
    useState(selectedStation);

  const [connectorId, setConnectorId] =
    useState("");

  const [bookingDate, setBookingDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [loadingStations, setLoadingStations] =
    useState(true);

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  const [successBooking, setSuccessBooking] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [myBookings, setMyBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchMyBookings = async () => {
    if (!user?.id) return;
    try {
      const res = await apiFetch(`${API_URL}/bookings/user/${user.id}`);
      const result = await res.json();
      if (result.success) setMyBookings(result.data || []);
    } catch {}
    finally { setBookingsLoading(false); }
  };

  const handleCancel = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      const res = await apiFetch(`${API_URL}/bookings/${bookingId}/cancel`, { method: "PATCH" });
      const result = await res.json();
      if (result.success) {
        setMyBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status: "Cancelled" } : b));
      }
    } catch {}
    finally { setCancellingId(null); }
  };

  useEffect(() => { fetchMyBookings(); }, [user]);

  // ========================================
  // FETCH STATIONS
  // ========================================

  useEffect(() => {
    const fetchStations = async () => {
      try {
        setLoadingStations(true);

        const response = await apiFetch(`${API_URL}/stations`);

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const result =
          await response.json();

        if (result.success) {
          const stationList =
            result.data || [];

          setStations(stationList);

          // If station already came from Stations page,
          // keep it selected.
          if (selectedStation?._id) {
            const matchingStation =
              stationList.find(
                (item) =>
                  item._id ===
                  selectedStation._id
              );

            if (matchingStation) {
              setStation(
                matchingStation
              );
            }
          }
        }
      } catch (error) {
        console.error(
          "Failed to fetch stations:",
          error
        );

        setErrorMessage(
          "Could not load charging stations."
        );
      } finally {
        setLoadingStations(false);
      }
    };

    fetchStations();
  }, [selectedStation]);

  // ========================================
  // AUTO SELECT CONNECTOR
  // ========================================

  useEffect(() => {
    if (
      station?.connectors?.length > 0
    ) {
      setConnectorId(
        String(
          station.connectors[0].ID ??
            station.connectors[0].id ??
            station.connectors[0]._id ??
            ""
        )
      );
    } else {
      setConnectorId("");
    }
  }, [station]);

  // ========================================
  // AUTO END TIME
  // ========================================

  useEffect(() => {
    if (startTime) {
      const automaticEnd =
        getEndTime(startTime);

      setEndTime(automaticEnd);
    } else {
      setEndTime("");
    }
  }, [startTime]);

  // ========================================
  // HANDLE STATION
  // ========================================

  const handleStationChange = (
    event
  ) => {
    const selectedId =
      event.target.value;

    const selected =
      stations.find(
        (item) =>
          item._id === selectedId
      );

    setStation(selected || null);
    setSuccessMessage("");
    setSuccessBooking(null);
    setErrorMessage("");
  };

  // ========================================
  // HANDLE CONNECTOR
  // ========================================

  const handleConnectorChange = (
    event
  ) => {
    setConnectorId(event.target.value);
    setSuccessMessage("");
    setSuccessBooking(null);
    setErrorMessage("");
  };

  // ========================================
  // HANDLE DATE
  // ========================================

  const handleDateChange = (
    event
  ) => {
    setBookingDate(
      event.target.value
    );

    setSuccessMessage("");
    setErrorMessage("");
  };

  // ========================================
  // HANDLE START TIME
  // ========================================

  const handleStartTimeChange = (
    value
  ) => {
    setStartTime(value);

    setSuccessMessage("");
    setErrorMessage("");
  };

  // ========================================
  // HANDLE END TIME
  // ========================================

  const handleEndTimeChange = (
    value
  ) => {
    setEndTime(value);

    setSuccessMessage("");
    setErrorMessage("");
  };

  // ========================================
  // SELECTED CONNECTOR
  // ========================================

  const selectedConnector =
    station?.connectors?.find(
      (connector) =>
        String(
          connector.ID ??
            connector.id ??
            connector._id
        ) === String(connectorId)
    );

  // ========================================
  // DURATION
  // ========================================

  const duration =
    calculateDuration(
      startTime,
      endTime
    );

  // ========================================
  // CREATE BOOKING
  // ========================================

  const handleBooking = async (
    event
  ) => {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    // ----------------------------------------
    // VALIDATION
    // ----------------------------------------

    if (!station?._id) {
      setErrorMessage(
        "Please select a charging station."
      );

      return;
    }

    if (!connectorId) {
      setErrorMessage(
        "Please select a connector."
      );

      return;
    }

    if (!bookingDate) {
      setErrorMessage(
        "Please select a booking date."
      );

      return;
    }

    if (!startTime) {
      setErrorMessage(
        "Please select a start time."
      );

      return;
    }

    if (!endTime) {
      setErrorMessage(
        "Please select an end time."
      );

      return;
    }

    const startDateTime =
      getDateTime(
        bookingDate,
        startTime
      );

    const endDateTime =
      getDateTime(
        bookingDate,
        endTime
      );

    if (
      !startDateTime ||
      !endDateTime
    ) {
      setErrorMessage(
        "Invalid date or time."
      );

      return;
    }

    if (
      endDateTime <=
      startDateTime
    ) {
      setErrorMessage(
        "End time must be after start time."
      );

      return;
    }

    // ----------------------------------------
    // PREVENT PAST DATE
    // ----------------------------------------

    const today = getTodayString();

    if (bookingDate < today) {
      setErrorMessage(
        "Please select today or a future date."
      );

      return;
    }

    // ----------------------------------------
    // PAYLOAD
    // ----------------------------------------

    const payload = {
      stationId: station._id,

      connectorId:
        Number(connectorId),

      chargerId:
        station.chargerId ||
        selectedConnector?.chargerId ||
        "EVCHARGER-001",

      bookingDate:
        `${bookingDate}T00:00:00.000Z`,

      startTime:
        startDateTime.toISOString(),

      endTime:
        endDateTime.toISOString(),

      userId: user?.id,
    };

    console.log(
      "Creating booking:",
      payload
    );

    // ----------------------------------------
    // API CALL
    // ----------------------------------------

    try {
      setBookingLoading(true);

      let response;
      let result;

      try {
        response = await apiFetch(
          `${API_URL}/bookings`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      } catch (networkError) {
        throw new Error(
          "Cannot reach the server. Make sure the backend is running on port 5000."
        );
      }

      try {
        result = await response.json();
      } catch {
        throw new Error(
          `Server returned an unexpected response (HTTP ${response.status}).`
        );
      }

      console.log("Booking response:", result);

      if (response.status === 409) {
        throw new Error(
          result.message ||
            "This connector is already booked for the selected time. Please choose a different time."
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            `Booking failed (HTTP ${response.status}).`
        );
      }

      if (!result.success) {
        throw new Error(result.message || "Booking failed.");
      }

      setSuccessMessage(
        "Charging slot booked successfully!"
      );

      setSuccessBooking(result.data);

      // ----------------------------------------
      // RESET TIME / DATE
      // ----------------------------------------

      setBookingDate("");
      setStartTime("");
      setEndTime("");
      setConnectorId("");
      fetchMyBookings();

    } catch (error) {
      console.error(
        "Create booking error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Failed to create booking."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <main className="min-h-screen p-4 sm:p-5 lg:p-6">
      <div className="mx-auto w-full max-w-[900px]">
        {/* ========================================
            PAGE HEADER
        ======================================== */}

        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Zap
                size={20}
                className="text-emerald-400"
                fill="currentColor"
              />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-white sm:text-2xl">
                Book a Charging Slot
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Select a station, connector
                and preferred charging time.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================
            SUCCESS CONFIRMATION CARD
        ======================================== */}

        {successMessage && successBooking && (
          <div className="mb-5 overflow-hidden rounded-2xl border border-emerald-500/25 bg-emerald-500/5">
            <div className="flex items-center gap-3 border-b border-emerald-500/15 px-5 py-4">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
              <p className="text-sm font-semibold text-emerald-300">
                Charging slot booked successfully!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-600">Station</p>
                <p className="mt-1 text-xs font-medium text-white">
                  {successBooking.stationId?.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-600">Connector</p>
                <p className="mt-1 text-xs font-medium text-white">
                  #{successBooking.connectorId}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-600">Status</p>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {successBooking.status}
                </span>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-600">Date</p>
                <p className="mt-1 text-xs font-medium text-white">
                  {new Date(successBooking.bookingDate).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-600">Start</p>
                <p className="mt-1 text-xs font-medium text-white">
                  {new Date(successBooking.startTime).toLocaleTimeString("en-IN", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-600">End</p>
                <p className="mt-1 text-xs font-medium text-white">
                  {new Date(successBooking.endTime).toLocaleTimeString("en-IN", {
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================
            ERROR MESSAGE
        ======================================== */}

        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <p className="text-xs leading-5 text-red-300">
              {errorMessage}
            </p>
          </div>
        )}

        {/* ========================================
            BOOKING CARD
        ======================================== */}

        <form
          onSubmit={handleBooking}
          className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#07151f]"
        >
          {/* Card Header */}

          <div className="border-b border-white/[0.06] px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <PlugZap
                  size={18}
                  className="text-emerald-400"
                />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  Charging Details
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Choose where and when you
                  want to charge.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}

          <div className="space-y-5 p-5 sm:p-6">
            {/* ========================================
                STATION + CONNECTOR
            ======================================== */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Station */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-[11px] font-medium text-slate-300">
                  <MapPin
                    size={13}
                    className="text-emerald-400"
                  />

                  Charging Station
                </label>

                <div className="relative">
                  <select
                    value={
                      station?._id || ""
                    }
                    onChange={
                      handleStationChange
                    }
                    disabled={
                      loadingStations
                    }
                    className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#071923] px-4 py-3 text-xs font-medium text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      {loadingStations
                        ? "Loading stations..."
                        : "Select a charging station"}
                    </option>

                    {stations.map(
                      (item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name ||
                            "Unnamed Charging Station"}
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                {station?.address && (
                  <p className="mt-1.5 flex items-start gap-1.5 text-[9px] leading-4 text-slate-600">
                    <MapPin
                      size={10}
                      className="mt-0.5 shrink-0"
                    />

                    {station.address}
                  </p>
                )}
              </div>

              {/* Connector */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-[11px] font-medium text-slate-300">
                  <Zap
                    size={13}
                    className="text-emerald-400"
                  />

                  Connector
                </label>

                <div className="relative">
                  <select
                    value={connectorId}
                    onChange={
                      handleConnectorChange
                    }
                    disabled={
                      !station ||
                      !station.connectors
                        ?.length
                    }
                    className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#071923] px-4 py-3 text-xs font-medium text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">
                      {!station
                        ? "Select station first"
                        : !station.connectors
                            ?.length
                        ? "No connector available"
                        : "Select a connector"}
                    </option>

                    {station?.connectors?.map(
                      (
                        connector,
                        index
                      ) => {
                        const id =
                          connector.ID ??
                          connector.id ??
                          connector._id;

                        const title =
                          connector
                            .ConnectionType
                            ?.Title ||
                          connector
                            .ConnectionType
                            ?.FormalName ||
                          "Unknown Connector";

                        const power =
                          connector.PowerKW;

                        return (
                          <option
                            key={
                              id ??
                              index
                            }
                            value={id}
                          >
                            {title}
                            {power
                              ? ` — ${power} kW`
                              : ""}
                          </option>
                        );
                      }
                    )}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                {selectedConnector && (
                  <p className="mt-1.5 text-[9px] text-slate-600">
                    {selectedConnector.PowerKW
                      ? `${selectedConnector.PowerKW} kW`
                      : "Power information unavailable"}
                  </p>
                )}
              </div>
            </div>

            {/* ========================================
                DATE
            ======================================== */}

            <div>
              <label className="mb-2 flex items-center gap-2 text-[11px] font-medium text-slate-300">
                <CalendarDays
                  size={13}
                  className="text-emerald-400"
                />

                Booking Date
              </label>

              <input
                type="date"
                value={bookingDate}
                min={getTodayString()}
                onChange={
                  handleDateChange
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#071923] px-4 py-3 text-sm font-medium text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10"
              />

              {bookingDate && (
                <p className="mt-1.5 text-[9px] text-slate-600">
                  Selected:{" "}
                  {formatDateForDisplay(
                    bookingDate
                  )}
                </p>
              )}
            </div>

            {/* ========================================
                TIME
            ======================================== */}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <label className="flex items-center gap-2 text-[11px] font-medium text-slate-300">
                  <Clock3
                    size={13}
                    className="text-emerald-400"
                  />

                  Charging Time
                </label>

                {duration && (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-medium text-emerald-400">
                    {duration.hours > 0
                      ? `${duration.hours} ${
                          duration.hours ===
                          1
                            ? "hour"
                            : "hours"
                        }`
                      : ""}

                    {duration.minutes >
                    0
                      ? ` ${duration.minutes} min`
                      : ""}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                {/* Start */}

                <TimeSelect
                  label="Start Time"
                  value={startTime}
                  onChange={
                    handleStartTimeChange
                  }
                />

                <div className="hidden pb-3 sm:block">
                  <ArrowRight
                    size={16}
                    className="text-slate-600"
                  />
                </div>

                {/* End */}

                <TimeSelect
                  label="End Time"
                  value={endTime}
                  minTime={startTime}
                  onChange={
                    handleEndTimeChange
                  }
                />
              </div>

              {/* Time Preview */}

              {startTime &&
                endTime &&
                duration && (
                  <div className="mt-3 flex flex-col gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[9px] text-slate-600">
                        Charging schedule
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-300">
                        {formatTime(
                          startTime
                        )}{" "}
                        →{" "}
                        {formatTime(
                          endTime
                        )}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-[9px] text-slate-600">
                        Total duration
                      </p>

                      <p className="mt-1 text-xs font-semibold text-emerald-400">
                        {duration.hours > 0
                          ? `${duration.hours} hr`
                          : ""}

                        {duration.minutes >
                        0
                          ? ` ${duration.minutes} min`
                          : ""}
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {/* ========================================
                SELECTED STATION SUMMARY
            ======================================== */}

            {station &&
              selectedConnector && (
                <div className="rounded-xl border border-white/[0.06] bg-[#091b26] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                      <Zap
                        size={16}
                        className="text-emerald-400"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[9px] uppercase tracking-wider text-slate-600">
                        Booking Summary
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {station.name}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {selectedConnector
                          .ConnectionType
                          ?.Title ||
                          "Connector"}{" "}
                        {selectedConnector.PowerKW
                          ? `• ${selectedConnector.PowerKW} kW`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              )}

            {/* ========================================
                SUBMIT
            ======================================== */}

            <button
              type="submit"
              disabled={
                bookingLoading ||
                !station ||
                !connectorId ||
                !bookingDate ||
                !startTime ||
                !endTime
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-emerald-400 hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
            >
              {bookingLoading ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />

                  Booking...
                </>
              ) : (
                <>
                  <Zap
                    size={16}
                    fill="currentColor"
                  />

                  Book Charging Slot
                </>
              )}
            </button>

            {/* Security text */}

            <p className="text-center text-[9px] text-slate-600">
              Your booking will be securely
              stored in EV ChargeHub.
            </p>
          </div>
        </form>

        {/* MY BOOKINGS */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#07151f]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h3 className="text-sm font-semibold text-white">My Bookings</h3>
            <p className="mt-0.5 text-[10px] text-slate-500">Your recent slot reservations</p>
          </div>

          {bookingsLoading ? (
            <div className="flex items-center justify-center py-10 text-xs text-slate-500">
              <Loader2 size={14} className="mr-2 animate-spin" /> Loading...
            </div>
          ) : myBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarDays size={26} className="mb-2 text-slate-600" />
              <p className="text-xs text-slate-500">No bookings yet</p>
              <p className="mt-0.5 text-[10px] text-slate-600">Book a slot above and it will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {myBookings.map((b) => (
                <div key={b._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-white">{b.stationId?.name || "Station"}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {new Date(b.bookingDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      {" · "}
                      {new Date(b.startTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      {" → "}
                      {new Date(b.endTime).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[9px] font-medium ${
                      b.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-400" :
                      b.status === "Cancelled" ? "bg-red-500/10 text-red-400" :
                      "bg-amber-500/10 text-amber-400"
                    }`}>{b.status}</span>
                    {(b.status === "Confirmed" || b.status === "Pending") && (
                      <button
                        onClick={() => handleCancel(b._id)}
                        disabled={cancellingId === b._id}
                        className="flex items-center gap-1 rounded-lg border border-red-500/20 bg-red-500/5 px-2 py-1 text-[9px] font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {cancellingId === b._id ? <Loader2 size={10} className="animate-spin" /> : <X size={10} />}
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

export default Booking;