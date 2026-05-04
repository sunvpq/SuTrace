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
      <header className="hidden md:flex items-center justify-between text-white px-6 py-3 z-50 flex-shrink-0 border-b border-dark-border" style={{ minHeight: '56px', background: '#0f1923' }}>
        <div className="flex items-center">
          <img src="/sutracelogo.jpeg" alt="SuTrace" style={{ height: '36px' }} className="rounded-lg" />
        </div>

        <nav className="flex gap-1.5">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 border ${
                  isActive
                    ? 'bg-water text-white border-water shadow-lg shadow-water/25'
                    : 'text-water-muted border-dark-border hover:bg-white/5 hover:text-white hover:border-water/40'
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
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t flex z-50 pb-safe"
        style={{ background: '#0f1923', borderColor: '#2d4a5f' }}>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-1 text-xs font-semibold transition-colors ${
                isActive ? '' : ''
              }`
            }
            style={({ isActive }) => ({ color: isActive ? '#00b4d8' : '#5a8ea3' })}
          >
            {l.icon}
            {l.label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
