import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Карта', icon: '🗺️' },
  { to: '/add', label: 'Добавить', icon: '➕' },
  { to: '/dashboard', label: 'Дашборд', icon: '📊' },
]

export default function Header() {
  return (
    <>
      {/* Desktop header */}
      <header className="hidden md:flex items-center justify-between bg-primary-700 text-white px-6 py-3 shadow-md z-50">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💧</span>
          <h1 className="text-xl font-bold tracking-tight">SuTrace</h1>
        </div>
        <nav className="flex gap-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/20' : 'hover:bg-white/10'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs ${
                isActive ? 'text-primary-700 font-semibold' : 'text-gray-500'
              }`
            }
          >
            <span className="text-lg">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
