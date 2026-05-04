import { useState } from 'react'

const TYPE_OPTIONS = [
  { value: '', label: 'Все типы' },
  { value: 'borehole', label: 'Скважина' },
  { value: 'well', label: 'Колодец' },
  { value: 'water_truck', label: 'Водовоз' },
  { value: 'spring', label: 'Родник' },
  { value: 'other', label: 'Другое' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'Все статусы' },
  { value: 'active', label: 'Работает' },
  { value: 'broken', label: 'Сломана' },
  { value: 'abandoned', label: 'Заброшена' },
]

const QUALITY_OPTIONS = [
  { value: '', label: 'Любое качество' },
  { value: 'fresh', label: 'Пресная' },
  { value: 'slightly_saline', label: 'Слабосолёная' },
  { value: 'saline', label: 'Солёная' },
  { value: 'technical', label: 'Техническая' },
  { value: 'unknown', label: 'Неизвестно' },
]

const selectClass = 'w-full border border-[#2d4a5f] rounded-lg px-3 py-2 text-sm bg-[#0f1923] text-white focus:ring-2 focus:ring-[#00b4d8] focus:border-[#00b4d8] outline-none transition-colors appearance-none cursor-pointer'
const labelClass = 'block text-xs font-semibold text-[#7eb8cc] uppercase tracking-wider mb-1.5'

function FilterSelects({ filters, onChange }) {
  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Тип</label>
        <select value={filters.type} onChange={e => onChange('type', e.target.value)} className={selectClass}>
          {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label className={labelClass}>Статус</label>
        <select value={filters.status} onChange={e => onChange('status', e.target.value)} className={selectClass}>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <div>
        <label className={labelClass}>Качество воды</label>
        <select value={filters.water_quality} onChange={e => onChange('water_quality', e.target.value)} className={selectClass}>
          {QUALITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    </div>
  )
}

// Panel mode: used inside the desktop sidebar (always visible)
export function FilterPanel({ filters, setFilters }) {
  const handleChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))
  const hasActive = filters.type || filters.status || filters.water_quality

  return (
    <div className="p-4 border-b border-[#2d4a5f]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-[#7eb8cc] uppercase tracking-wider">Фильтры</span>
        {hasActive && (
          <button
            onClick={() => setFilters({ type: '', status: '', water_quality: '' })}
            className="text-xs text-water hover:text-water-light font-semibold transition-colors"
          >
            Сбросить
          </button>
        )}
      </div>
      <FilterSelects filters={filters} onChange={handleChange} />
    </div>
  )
}

// Floating mode: used on mobile (toggle button overlay on map)
export default function Filters({ filters, setFilters }) {
  const [open, setOpen] = useState(false)
  const hasActive = filters.type || filters.status || filters.water_quality

  const handleChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <button
        onClick={() => setOpen(!open)}
        className="backdrop-blur shadow-lg rounded-xl px-4 py-2.5 text-sm font-semibold text-white flex items-center gap-2 border transition-all"
        style={{ background: 'rgba(26,46,59,0.92)', borderColor: '#2d4a5f' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="11" y1="18" x2="13" y2="18" />
        </svg>
        Фильтры
        {hasActive && (
          <span className="text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold" style={{ background: '#00b4d8' }}>!</span>
        )}
      </button>

      {open && (
        <div className="mt-2 rounded-xl shadow-2xl p-4 w-64 border" style={{ background: '#1a2e3b', borderColor: '#2d4a5f' }}>
          <FilterSelects filters={filters} onChange={handleChange} />
          <button
            onClick={() => { setFilters({ type: '', status: '', water_quality: '' }); setOpen(false) }}
            className="w-full mt-3 text-xs font-semibold transition-colors"
            style={{ color: '#00b4d8' }}
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  )
}
