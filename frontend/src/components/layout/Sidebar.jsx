import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Cog,
  Wrench,
  Boxes,
  Users,
  BarChart3,
  FileText,
  Settings,
  Bell,
  CalendarCheck,
  ClipboardList,
  X,
} from "lucide-react";

const ADMIN_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/machines", label: "Machines", icon: Cog },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
  { to: "/inventory", label: "Inventory", icon: Boxes },
  { to: "/workers", label: "Workers", icon: Users },
  { to: "/production", label: "Production", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

const WORKER_LINKS = [
  { to: "/worker-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/my-machines", label: "My Machines", icon: Cog },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/work-schedule", label: "Schedule", icon: ClipboardList },
  { to: "/notifications", label: "Notifications", icon: Bell },
];

export default function Sidebar({ role, mobileOpen, onClose }) {
  const links = role === "ADMIN" ? ADMIN_LINKS : WORKER_LINKS;

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 z-40 flex flex-col
          bg-[var(--sidebar-bg)] transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-between px-5 h-16 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-brand-500)] flex items-center justify-center font-display font-bold text-white text-sm">
              TF
            </div>
            <div>
              <p className="font-display font-semibold text-white text-sm leading-tight">TextileFlow</p>
              <p className="text-[10px] text-[var(--sidebar-text)] tracking-wide">Factory Monitor</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-[var(--sidebar-text)] p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04, ease: "easeOut" }}
            >
              <NavLink
                to={to}
                onClick={onClose}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-[var(--sidebar-bg-active)] text-[var(--sidebar-text-active)]"
                      : "text-[var(--sidebar-text)] hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="sidebar-active-bar"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-[var(--color-brand-400)]"
                        transition={{ duration: 0.25 }}
                      />
                    )}
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {label}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="px-4 py-4 mx-3 mb-3 rounded-xl bg-white/5">
          <p className="text-xs text-[var(--sidebar-text)] leading-relaxed">
            Running-stitch status dots show live machine pulse across your factory floor.
          </p>
        </div>
      </aside>
    </>
  );
}
