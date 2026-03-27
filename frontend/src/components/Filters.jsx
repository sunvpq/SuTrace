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

export default function Filters({ filters, setFilters }) {
  const [open, setOpen] = useState(false)

  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <button
        onClick={() => setOpen(!open)}
        className="bg-white shadow-lg rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 flex items-center gap-1"
      >
        🔍 Фильтры
        {(filters.type || filters.status || filters.water_quality) && (
          <span className="bg-primary-700 text-white text-xs rounded-full px-1.5 ml-1">!</span>
        )}
      </button>

      {open && (
        <div className="mt-2 bg-white rounded-lg shadow-xl p-4 w-64 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Тип</label>
            <select
              value={filters.type}
              onChange={e => handleChange('type', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Статус</label>
            <select
              value={filters.status}
              onChange={e => handleChange('status', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Качество воды</label>
            <select
              value={filters.water_quality}
              onChange={e => handleChange('water_quality', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {QUALITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button
            onClick={() => { setFilters({ type: '', status: '', water_quality: '' }); setOpen(false) }}
            className="w-full text-xs text-primary-700 hover:underline"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  )
}
