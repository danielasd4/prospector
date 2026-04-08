import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, MessageSquare, Settings, Zap } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/templates', icon: MessageSquare, label: 'Templates' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
]

export default function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-zinc-950 border-r border-zinc-800 min-h-screen fixed left-0 top-0 z-30">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-800">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-zinc-100 text-sm tracking-wide">Prospector</span>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                    : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-zinc-600'}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-zinc-950 border-t border-zinc-800 flex">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-3 gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-brand-400' : 'text-zinc-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-400' : 'text-zinc-600'}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
