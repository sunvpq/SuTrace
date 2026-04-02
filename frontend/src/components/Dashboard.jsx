import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// leaflet.heat attaches itself to L when imported
import 'leaflet.heat'

const STATUS_COLORS = {
  active: '#22c55e',
  broken: '#ef4444',
  abandoned: '#6b7280',
}
const STATUS_LABELS = {
  active: 'Работает',
  broken: 'Сломана',
  abandoned: 'Заброшена',
}
const QUALITY_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#6b7280']
const QUALITY_LABELS = {
  fresh: 'Пресная',
  slightly_saline: 'Слабосолёная',
  saline: 'Солёная',
  technical: 'Техническая',
  unknown: 'Неизвестно',
}

// Heatmap layer component
function HeatmapLayer({ points }) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return
    const heatData = points
      .filter(p => p.status !== 'active' || p.water_quality !== 'fresh')
      .map(p => [p.latitude, p.longitude, 0.5])

    let heatLayer
    try {
      heatLayer = L.heatLayer(heatData, {
        radius: 40,
        blur: 25,
        gradient: { 0.2: '#3b82f6', 0.5: '#eab308', 0.8: '#ef4444' },
      }).addTo(map)
    } catch (e) {
      // leaflet.heat not available, skip
    }
    return () => {
      if (heatLayer) map.removeLayer(heatLayer)
    }
  }, [map, points])

  return null
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  )
}

export default function Dashboard({ apiBase }) {
  const [stats, setStats] = useState(null)
  const [byDistrict, setByDistrict] = useState([])
  const [points, setPoints] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [s, d, p] = await Promise.all([
          fetch(`${apiBase}/stats`).then(r => r.json()),
          fetch(`${apiBase}/stats/by-district`).then(r => r.json()),
          fetch(`${apiBase}/points`).then(r => r.json()),
        ])
        setStats(s)
        setByDistrict(d)
        setPoints(p)
        setRecent([...p].slice(0, 10))
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchAll()
  }, [apiBase])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 text-sm">Загрузка данных...</div>
      </div>
    )
  }

  const pieStatusData = stats
    ? Object.entries(stats.by_status).map(([k, v]) => ({
        name: STATUS_LABELS[k] || k,
        value: v,
        color: STATUS_COLORS[k] || '#ccc',
      }))
    : []

  const pieQualityData = stats
    ? Object.entries(stats.by_quality).map(([k, v]) => ({
        name: QUALITY_LABELS[k] || k,
        value: v,
      }))
    : []

  const TYPE_LABELS = {
    borehole: 'Скважина', well: 'Колодец', water_truck: 'Водовоз',
    spring: 'Родник', other: 'Другое',
  }
  const STATUS_BADGE = {
    active: 'bg-green-100 text-green-800',
    broken: 'bg-red-100 text-red-800',
    abandoned: 'bg-gray-100 text-gray-700',
  }
  const QUALITY_BADGE = {
    fresh: 'bg-green-100 text-green-800',
    slightly_saline: 'bg-yellow-100 text-yellow-800',
    saline: 'bg-orange-100 text-orange-800',
    technical: 'bg-red-100 text-red-800',
    unknown: 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-50 pb-16 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Дашборд акимата</h2>
          <p className="text-sm text-slate-500 mt-1">Западный Казахстан — Атырауская и Мангистауская области</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Всего точек" value={stats?.total} icon="💧" color="bg-blue-50" />
          <StatCard label="Работают" value={stats?.by_status?.active} icon="✅" color="bg-green-50" />
          <StatCard label="Заброшены" value={stats?.by_status?.abandoned} icon="⛔" color="bg-gray-50" />
          <StatCard label="Пресная вода" value={stats?.by_quality?.fresh} icon="🏞️" color="bg-cyan-50" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status pie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">По статусу</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Quality pie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">По качеству воды</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieQualityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  dataKey="value"
                  label={({ name, percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                >
                  {pieQualityData.map((_, i) => (
                    <Cell key={i} fill={QUALITY_COLORS[i % QUALITY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  formatter={(value) => <span style={{ fontSize: '11px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* By district bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">По районам</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={byDistrict}
                layout="vertical"
                margin={{ left: 8, right: 8 }}
              >
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="district"
                  width={90}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill="#1e40af" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Тепловая карта «белых зон»</h3>
          <p className="text-xs text-gray-500 mb-3">
            Красные зоны — высокая концентрация нерабочих/солёных точек
          </p>
          <div className="h-64 rounded-lg overflow-hidden">
            <MapContainer center={[45.5, 52.5]} zoom={6} className="h-full w-full" zoomControl={false}>
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={20}
              />
              <HeatmapLayer points={points} />
            </MapContainer>
          </div>
        </div>

        {/* Recent points table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Последние добавленные точки
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b">
                  <th className="pb-2 pr-3">Название</th>
                  <th className="pb-2 pr-3">Тип</th>
                  <th className="pb-2 pr-3">Статус</th>
                  <th className="pb-2 pr-3">Качество</th>
                  <th className="pb-2 pr-3">Район</th>
                  <th className="pb-2">Координаты</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 pr-3 font-medium text-gray-800 max-w-[150px] truncate">{p.name}</td>
                    <td className="py-2 pr-3 text-gray-600">{TYPE_LABELS[p.type] || p.type}</td>
                    <td className="py-2 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[p.status] || 'bg-gray-100 text-gray-600'}`}>
                        {STATUS_LABELS[p.status] || p.status}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${QUALITY_BADGE[p.water_quality] || 'bg-gray-100 text-gray-600'}`}>
                        {QUALITY_LABELS[p.water_quality] || p.water_quality}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-500 text-xs">{p.district || '—'}</td>
                    <td className="py-2 text-gray-400 text-xs">
                      {p.latitude?.toFixed(3)}, {p.longitude?.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
