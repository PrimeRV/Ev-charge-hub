import {
  LayoutDashboard,
  MapPin,
  BatteryCharging,
  Zap,
  Users,
  Receipt,
  BarChart3,
  Bell,
  Settings,
  Leaf,
  X,
  ChevronRight,
  CalendarPlus,
} from "lucide-react";

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },

  {
    id: "stations",
    label: "Stations",
    icon: MapPin,
  },

  {
    id: "booking",
    label: "Book Charging",
    icon: CalendarPlus,
  },

  {
    id: "chargers",
    label: "Chargers",
    icon: BatteryCharging,
  },

  {
    id: "sessions",
    label: "Sessions",
    icon: Zap,
  },

  {
    id: "users",
    label: "Users",
    icon: Users,
  },

  {
    id: "transactions",
    label: "Transactions",
    icon: Receipt,
  },

  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
  },

  {
    id: "alerts",
    label: "Alerts",
    icon: Bell,
  },

  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

function Sidebar({
  mobileOpen,
  setMobileOpen,
  setCurrentPage,
  currentPage,
}) {
  function handleNavigation(page) {
    if (setCurrentPage) {
      setCurrentPage(page);
    }

    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile overlay */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[225px] flex-col
          border-r border-white/[0.06]
          bg-[#03101a]
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* ========================================
            BRAND
        ======================================== */}

        <div className="flex h-[78px] items-center justify-between px-5">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 shadow-lg shadow-emerald-500/20">

              <Zap
                size={21}
                strokeWidth={2.8}
                className="text-white"
                fill="white"
              />

            </div>

            <div className="text-[17px] font-bold tracking-tight text-white">

              <span className="text-emerald-400">
                EV
              </span>{" "}
              ChargeHub

            </div>

          </div>

          {/* Mobile close */}

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>

        </div>


        {/* ========================================
            NAVIGATION
        ======================================== */}

        <nav className="flex-1 overflow-y-auto px-2.5 py-4">

          <div className="space-y-1">

            {menuItems.map((item) => {

              const Icon = item.icon;

              const isActive =
                currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    handleNavigation(item.id)
                  }
                  className={`
                    group flex w-full items-center gap-3
                    rounded-lg px-3 py-3
                    text-[13px] font-medium
                    transition-all duration-200

                    ${
                      isActive
                        ? "bg-emerald-500/20 text-white shadow-[inset_3px_0_0_#10b981]"
                        : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                    }
                  `}
                >

                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className={
                      isActive
                        ? "text-emerald-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    }
                  />

                  <span>
                    {item.label}
                  </span>

                  {isActive && (
                    <ChevronRight
                      size={14}
                      className="ml-auto text-emerald-400"
                    />
                  )}

                </button>
              );

            })}

          </div>

        </nav>


        {/* ========================================
            GO GREEN CARD
        ======================================== */}

        <div className="m-3 rounded-2xl border border-emerald-400/10 bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent p-4">

          <div className="mb-2 flex items-center gap-2">

            <Leaf
              size={17}
              className="text-emerald-400"
              fill="currentColor"
            />

            <span className="text-sm font-semibold text-emerald-300">
              Go Green!
            </span>

          </div>

          <p className="text-[11px] leading-5 text-slate-400">
            Every charge you manage makes the future cleaner.
          </p>

          <div className="mt-4 flex justify-end">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400/10">

              <Leaf
                size={24}
                className="text-emerald-400"
                fill="currentColor"
              />

            </div>

          </div>

        </div>


        {/* ========================================
            VERSION
        ======================================== */}

        <div className="px-5 pb-4 text-[10px] text-slate-600">
          EV ChargeHub v1.0
        </div>

      </aside>
    </>
  );
}

export default Sidebar;