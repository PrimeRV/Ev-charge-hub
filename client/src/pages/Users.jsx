import { useEffect, useState } from "react";
import { apiFetch } from "../apiFetch.js";
import {
  Users,
  ShieldCheck,
  User,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  Database,
  CalendarDays,
  Search,
} from "lucide-react";

const ROLE_COLORS = {
  admin: "bg-purple-500/10 text-purple-400",
  user:  "bg-blue-500/10 text-blue-400",
};

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (users.length === 0) setLoading(true);
      setError("");

      const res = await apiFetch("/api/users");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      if (!result.success) throw new Error(result.message);

      setUsers(result.data || []);
      setSummary(result.summary || null);
    } catch (err) {
      setError("Failed to load users.");
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const roleMatch = roleFilter === "All" || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const searchMatch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    return roleMatch && searchMatch;
  });

  return (
    <main className="space-y-5 p-4 sm:p-5 lg:p-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-400">
            User Management
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Users</h2>
          <p className="mt-1 text-xs text-slate-500">
            Registered users and their activity.
          </p>
        </div>

        <button
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="flex w-fit items-center gap-2 rounded-xl border border-white/[0.08] bg-[#07151f] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-emerald-500/30 hover:text-white disabled:opacity-50"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Total Users</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "..." : summary?.total ?? 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
              <Users size={18} className="text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Admins</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "..." : summary?.admins ?? 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
              <ShieldCheck size={18} className="text-purple-400" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500">Regular Users</p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {loading ? "..." : summary?.regularUsers ?? 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <User size={18} className="text-emerald-400" />
            </div>
          </div>
        </div>

      </section>

      {/* TABLE */}
      <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#07151f]">

        {/* FILTERS */}
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Registered Users</h3>
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[9px] text-slate-400">
              {filtered.length}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or email..."
                className="rounded-lg border border-white/[0.08] bg-[#071923] py-1.5 pl-8 pr-3 text-[10px] text-white outline-none placeholder:text-slate-600 focus:border-emerald-500/40 w-48"
              />
            </div>

            {/* Role filter */}
            {["All", "admin", "user"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-medium transition capitalize ${
                  roleFilter === r
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-white/[0.04] text-slate-400 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <LoaderCircle size={16} className="animate-spin" />
              Loading users...
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <AlertCircle size={28} className="mx-auto mb-3 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => fetchUsers(true)}
                className="mt-4 rounded-lg bg-white/5 px-4 py-2 text-xs text-slate-300 hover:bg-white/10"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* DESKTOP TABLE */}
        {!loading && !error && filtered.length > 0 && (
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.05] text-[10px] text-slate-500">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Bookings</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b border-white/[0.035] transition hover:bg-white/[0.02]"
                  >
                    {/* USER */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[11px] font-semibold text-emerald-400">
                          {getInitials(u.name)}
                        </div>
                        <p className="text-xs font-medium text-slate-200">{u.name}</p>
                      </div>
                    </td>

                    {/* EMAIL */}
                    <td className="px-5 py-4">
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </td>

                    {/* ROLE */}
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-medium capitalize ${ROLE_COLORS[u.role] || "bg-slate-500/10 text-slate-400"}`}>
                        {u.role}
                      </span>
                    </td>

                    {/* BOOKINGS */}
                    <td className="px-5 py-4">
                      <p className="text-[10px] font-medium text-slate-300">{u.bookingCount}</p>
                    </td>

                    {/* JOINED */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays size={10} className="text-slate-600" />
                        <p className="text-[10px] text-slate-400">{formatDate(u.createdAt)}</p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* MOBILE CARDS */}
        {!loading && !error && filtered.length > 0 && (
          <div className="divide-y divide-white/[0.04] md:hidden">
            {filtered.map((u) => (
              <div key={u._id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[11px] font-semibold text-emerald-400">
                    {getInitials(u.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-white">{u.name}</p>
                    <p className="mt-0.5 truncate text-[9px] text-slate-500">{u.email}</p>
                    <p className="mt-0.5 text-[9px] text-slate-600">Joined {formatDate(u.createdAt)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium capitalize ${ROLE_COLORS[u.role] || ""}`}>
                    {u.role}
                  </span>
                  <p className="text-[9px] text-slate-600">{u.bookingCount} bookings</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <Database size={30} className="mx-auto mb-3 text-slate-600" />
              <p className="text-sm text-slate-400">No users found</p>
              <p className="mt-1 text-[10px] text-slate-600">
                Register a user via the signup form to see them here.
              </p>
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-3">
          <div className="flex items-center gap-1.5">
            <Database size={10} className="text-slate-600" />
            <p className="text-[9px] text-slate-600">Source: MongoDB Users collection</p>
          </div>
          <p className="text-[9px] text-slate-700">{filtered.length} users</p>
        </div>

      </section>
    </main>
  );
}
