import { useEffect, useRef, useState } from "react";
import { Menu, Search, Bell, Sun, Moon, ChevronDown, AlertCircle, AlertTriangle, Info, X, LogOut } from "lucide-react";
import { apiFetch } from "../apiFetch.js";
import { useTheme } from "../ThemeContext.jsx";
import { useAuth } from "../AuthContext.jsx";

const SEVERITY = {
  High:   { icon: AlertCircle,   color: "text-red-400",   dot: "bg-red-400",   badge: "bg-red-500" },
  Medium: { icon: AlertTriangle, color: "text-amber-400", dot: "bg-amber-400", badge: "bg-amber-500" },
  Low:    { icon: Info,          color: "text-blue-400",  dot: "bg-blue-400",  badge: "bg-blue-500" },
};

function formatTime(ts) {
  if (!ts) return "";
  return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

function Header({ setMobileOpen, setCurrentPage }) {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [alerts, setAlerts]         = useState([]);
  const [open, setOpen]             = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [allStations, setAllStations] = useState([]);
  const dropdownRef                 = useRef(null);
  const searchRef                   = useRef(null);

  // Fetch stations once for search
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await apiFetch("/api/stations");
        const result = await res.json();
        if (result.success) setAllStations(result.data || []);
      } catch {}
    };
    fetchStations();
  }, []);

  // Filter stations on query change
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) { setSearchResults([]); setSearchOpen(false); return; }
    const results = allStations
      .filter((s) =>
        s.name?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.operator?.toLowerCase().includes(q)
      )
      .slice(0, 6);
    setSearchResults(results);
    setSearchOpen(results.length > 0);
  }, [searchQuery, allStations]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch alerts every 30s
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await apiFetch("/api/alerts");
        const result = await res.json();
        if (result.success) setAlerts(result.data || []);
      } catch {}
    };
    fetch_();
    const interval = setInterval(fetch_, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const highCount = alerts.filter((a) => a.severity === "High").length;
  const badgeCount = alerts.length;
  const badgeBg = highCount > 0 ? "bg-red-500" : alerts.length > 0 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <header className="sticky top-0 z-30 flex min-h-[78px] items-center justify-between border-b border-white/[0.06] bg-[#020d16]/90 px-4 backdrop-blur-xl sm:px-6 lg:px-7">

      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-[18px] font-semibold tracking-tight text-white sm:text-[19px]">
            Welcome back, Admin! 👋
          </h1>
          <p className="hidden text-[12px] text-slate-500 sm:block">
            Monitor, manage and optimize your EV charging network in real-time.
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="ml-4 flex items-center gap-2 sm:gap-4">

        {/* Search */}
        <div className="relative hidden md:block" ref={searchRef}>
          <div className="flex h-10 w-[250px] items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 lg:w-[335px]">
            <Search size={17} className="shrink-0 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
              placeholder="Search stations, locations..."
              className="w-full bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-600"
            />
            {searchQuery && (
              <button onClick={() => { setSearchQuery(""); setSearchOpen(false); }} className="text-slate-500 hover:text-white">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Search results dropdown */}
          {searchOpen && (
            <div className="absolute left-0 top-[calc(100%+6px)] w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07151f] shadow-2xl shadow-black/40 z-50">
              {searchResults.map((station) => (
                <button
                  key={station._id}
                  onClick={() => {
                    setCurrentPage("booking", station);
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                  className="flex w-full items-center justify-between border-b border-white/[0.04] px-4 py-3 text-left last:border-0 hover:bg-white/[0.04]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-white">{station.name}</p>
                    <p className="mt-0.5 truncate text-[9px] text-slate-500">{station.address}</p>
                  </div>
                  <span className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-[8px] font-medium ${
                    station.status === "Operational" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                  }`}>
                    {station.status}
                  </span>
                </button>
              ))}
              <div className="border-t border-white/[0.05] px-4 py-2">
                <p className="text-[9px] text-slate-600">{searchResults.length} station{searchResults.length !== 1 ? "s" : ""} found — click to book</p>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="hidden rounded-xl p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white sm:block"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* Bell */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative rounded-xl p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <Bell size={19} className={open ? "text-white" : ""} />
            {badgeCount > 0 && (
              <span className={`absolute right-1.5 top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-1 text-[8px] font-bold text-white ${badgeBg}`}>
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </button>

          {/* DROPDOWN */}
          {open && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[340px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07151f] shadow-2xl shadow-black/40">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell size={13} className="text-slate-400" />
                  <span className="text-xs font-semibold text-white">Alerts</span>
                  {badgeCount > 0 && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium text-white ${badgeBg}`}>
                      {badgeCount}
                    </span>
                  )}
                </div>
                <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>

              {/* List */}
              <div className="max-h-[360px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Bell size={22} className="mb-2 text-slate-600" />
                    <p className="text-xs text-slate-400">No active alerts</p>
                    <p className="mt-0.5 text-[10px] text-slate-600">Network is running smoothly.</p>
                  </div>
                ) : (
                  alerts.slice(0, 8).map((alert) => {
                    const sev = SEVERITY[alert.severity] || SEVERITY.Low;
                    const Icon = sev.icon;
                    return (
                      <div
                        key={alert.id}
                        className="flex items-start gap-3 border-b border-white/[0.04] px-4 py-3 last:border-0 hover:bg-white/[0.02]"
                      >
                        <div className={`mt-0.5 shrink-0 ${sev.color}`}>
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-semibold text-white">{alert.type}</span>
                            <span className="shrink-0 text-[9px] text-slate-600">{formatTime(alert.timestamp)}</span>
                          </div>
                          <p className="mt-0.5 text-[10px] leading-4 text-slate-400 line-clamp-2">{alert.message}</p>
                        </div>
                        <span className={`mt-1 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full ${sev.dot}`} />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/[0.06] px-4 py-3">
                <button
                  onClick={() => { setCurrentPage("alerts"); setOpen(false); }}
                  className="w-full rounded-xl bg-white/[0.04] py-2 text-[11px] font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                >
                  View All Alerts
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Divider */}
        <div className="hidden h-7 w-px bg-white/[0.08] sm:block" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 transition hover:bg-white/[0.04]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-xs font-semibold text-white">{user?.name || "User"}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role || "user"}</p>
            </div>
            <ChevronDown size={14} className="hidden text-slate-500 md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[200px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07151f] shadow-2xl shadow-black/40">
              <div className="border-b border-white/[0.06] px-4 py-3">
                <p className="text-xs font-semibold text-white">{user?.name}</p>
                <p className="mt-0.5 truncate text-[10px] text-slate-500">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-xs text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={13} />
                Sign out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;
