import { NavLink } from 'react-router-dom'

const MapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" />
    <line x1="15" y1="6" x2="15" y2="21" />
  </svg>
)

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

const links = [
  { to: '/', label: 'Карта', icon: <MapIcon /> },
  { to: '/add', label: 'Добавить', icon: <PlusIcon /> },
  { to: '/dashboard', label: 'Дашборд', icon: <ChartIcon /> },
]

export default function Header() {
  return (
    <>
      {/* Desktop header */}
      <header className="hidden md:flex items-center justify-between bg-navy-900 text-white px-6 py-3 shadow-lg z-50 flex-shrink-0" style={{ minHeight: '56px' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-lg shadow-md shadow-blue-500/30">
            💧
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none text-white">SuTrace</h1>
            <p className="text-xs text-blue-300 leading-none mt-0.5 font-medium">Trace Every Drop</p>
          </div>
        </div>

        <nav className="flex gap-1">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {l.icon}
              {l.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Mobile bottom tabs */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-navy-900 border-t border-white/10 flex z-50 pb-safe">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-blue-400' : 'text-slate-400'
              }`
            }
          >
            {l.icon}
            {l.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
