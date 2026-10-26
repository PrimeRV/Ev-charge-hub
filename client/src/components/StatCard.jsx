import {
  MapPinned,
  BatteryCharging,
  Activity,
  IndianRupee,
} from "lucide-react";

const iconMap = {
  stations: MapPinned,
  chargers: BatteryCharging,
  sessions: Activity,
  revenue: IndianRupee,
};

function StatCard({
  type,
  title,
  value,
  change,
  subtitle,
}) {
  const Icon = iconMap[type];

  const themes = {
    stations: {
      card: "from-emerald-500/[0.13] to-emerald-500/[0.02]",
      icon: "bg-emerald-500/15 text-emerald-400",
      border: "border-emerald-500/15",
    },

    chargers: {
      card: "from-blue-500/[0.13] to-blue-500/[0.02]",
      icon: "bg-blue-500/15 text-blue-400",
      border: "border-blue-500/15",
    },

    sessions: {
      card: "from-violet-500/[0.13] to-violet-500/[0.02]",
      icon: "bg-violet-500/15 text-violet-400",
      border: "border-violet-500/15",
    },

    revenue: {
      card: "from-amber-500/[0.13] to-amber-500/[0.02]",
      icon: "bg-amber-500/15 text-amber-400",
      border: "border-amber-500/15",
    },
  };

  const theme = themes[type];

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl
        border ${theme.border}
        bg-gradient-to-br ${theme.card}
        p-4
        transition-all duration-300
        hover:-translate-y-0.5
        hover:border-white/10
        hover:shadow-xl hover:shadow-black/20
        sm:p-5
      `}
    >

      {/* Top */}

      <div className="flex items-start justify-between">

        <div>
          <p className="text-[11px] font-medium text-slate-500 sm:text-xs">
            {title}
          </p>

          <h3
            className={`
              mt-2
              text-[25px]
              font-semibold
              tracking-tight
              text-white
              sm:text-[28px]
              ${value === "—" ? "text-slate-500" : ""}
            `}
          >
            {value}
          </h3>
        </div>

        <div
          className={`
            flex h-10 w-10
            items-center justify-center
            rounded-xl
            ${theme.icon}
          `}
        >
          <Icon size={20} />
        </div>

      </div>


      {/* Bottom */}

      <div className="mt-3 flex items-center gap-1.5">

        {change && (
          <span className="text-[10px] font-medium text-emerald-400">
            ↑ {change}
          </span>
        )}

        <span className="text-[10px] text-slate-500">
          {subtitle}
        </span>

      </div>

    </div>
  );
}

export default StatCard;