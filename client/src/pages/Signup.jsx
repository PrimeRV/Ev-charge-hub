import { useState } from "react";
import { Zap, Mail, Lock, User, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../AuthContext.jsx";

function PasswordStrength({ password }) {
  const checks = [password.length >= 6, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score = checks.filter(Boolean).length;
  const levels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "bg-red-500", "bg-amber-500", "bg-yellow-400", "bg-emerald-500"];
  const textColors = ["", "text-red-400", "text-amber-400", "text-yellow-400", "text-emerald-400"];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-white/[0.06]"}`} />
        ))}
      </div>
      <p className={`text-[10px] font-medium ${textColors[score]}`}>{levels[score]}</p>
    </div>
  );
}

export default function Signup({ onSwitchToLogin }) {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      let res;
      try {
        res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role: "user" }),
        });
      } catch {
        throw new Error("Cannot reach server. Make sure backend is running.");
      }
      let result;
      try { result = await res.json(); } catch { throw new Error("Server error. Try again."); }
      if (!res.ok || !result.success) throw new Error(result.message || "Registration failed");
      login(result.token, result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020b13] px-4">

      {/* Animated background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-[500px] w-[500px] animate-pulse rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] animate-pulse rounded-full bg-teal-500/10 blur-[120px]" style={{ animationDelay: "1s" }} />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-emerald-400/5 blur-[80px]" style={{ animationDelay: "2s" }} />
      </div>



      <div className="relative w-full max-w-[420px]">

        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 animate-ping rounded-2xl bg-emerald-500/20" style={{ animationDuration: "3s" }} />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-2xl shadow-emerald-500/40">
              <Zap size={30} strokeWidth={2.5} className="text-white" fill="white" />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">EV</span> ChargeHub
            </h1>
            <p className="mt-1.5 text-xs text-slate-500">Smart EV Charging Management Platform</p>
          </div>
        </div>

        {/* Glass card */}
        <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.03] shadow-2xl shadow-black/60 backdrop-blur-2xl">

          {/* Top accent line */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <div className="px-8 py-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-white">Create account</h2>
              <p className="mt-1 text-xs text-slate-500">Join EV ChargeHub to get started</p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 backdrop-blur-sm">
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
                <p className="text-xs leading-5 text-red-300">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-emerald-400">
                  <User size={15} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  required
                  autoComplete="name"
                  className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-emerald-500/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              {/* Email */}
              <div className="group relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-emerald-400">
                  <Mail size={15} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  autoComplete="email"
                  className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-emerald-500/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-500/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="group relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-emerald-400">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create password"
                    required
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.04] py-3.5 pl-11 pr-11 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-emerald-500/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-300"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                ) : (
                  <><Zap size={16} fill="currentColor" /> Create Account</>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-xs text-slate-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="font-medium text-emerald-400 transition hover:text-emerald-300"
              >
                Sign in
              </button>
            </p>
          </div>

          {/* Bottom accent */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
        </div>

        <p className="mt-5 text-center text-[10px] text-slate-700">
          EV ChargeHub · Charging Management Platform · v1.0
        </p>
      </div>
    </div>
  );
}
