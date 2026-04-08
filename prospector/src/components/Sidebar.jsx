import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Settings,
  Zap,
} from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/add', icon: UserPlus, label: 'Novo Lead' },
  { to: '/settings', icon: Settings, label: 'Config' },
]

export default function Sidebar() {
  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-56 shrink-0 h-screen sticky top-0 flex-col border-r border-zinc-800 bg-zinc-950">
        {/* Logo */}
        <div className="h-14 flex items-center gap-2.5 px-5 border-b border-zinc-800">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={14} className="text-zinc-950" fill="currentColor" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-100">
            Prospector
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-100 ${
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 font-medium'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600 font-mono">v1.0.0</p>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t border-zinc-800 bg-zinc-950">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-3 text-[10px] transition-colors ${
                isActive
                  ? 'text-brand-400'
                  : 'text-zinc-500'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
