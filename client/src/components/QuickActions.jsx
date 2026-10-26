import {
  MapPinned,
  BatteryCharging,
  BarChart3,
  Users,
  Plus,
} from "lucide-react";

const actions = [
  {
    title: "Add Station",
    icon: MapPinned,
    color: "emerald",
  },
  {
    title: "Add Charger",
    icon: BatteryCharging,
    color: "blue",
  },
  {
    title: "View Reports",
    icon: BarChart3,
    color: "violet",
  },
  {
    title: "Manage Users",
    icon: Users,
    color: "amber",
  },
];

const colors = {
  emerald:
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/10",

  blue:
    "bg-blue-500/10 text-blue-400 border-blue-500/10",

  violet:
    "bg-violet-500/10 text-violet-400 border-violet-500/10",

  amber:
    "bg-amber-500/10 text-amber-400 border-amber-500/10",
};

function QuickActions() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#07151f] p-5">

      <div className="flex items-center justify-between">

        <h3 className="text-sm font-semibold text-white">
          Quick Actions
        </h3>

        <Plus
          size={16}
          className="text-slate-600"
        />

      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">

        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              className="group rounded-xl border border-white/[0.05] bg-white/[0.02] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.04]"
            >

              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${colors[action.color]}`}
              >
                <Icon size={19} />
              </div>

              <p className="mt-3 text-[10px] font-medium text-slate-300 group-hover:text-white">
                {action.title}
              </p>

            </button>
          );
        })}

      </div>

    </div>
  );
}

export default QuickActions;