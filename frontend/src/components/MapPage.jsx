import { useState, useEffect, useRef, useCallback } from 'react'
import {
  MapContainer, TileLayer, useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import Filters, { FilterPanel } from './Filters'
import NearestButton from './NearestButton'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const TYPE_LABELS = {
  borehole: 'Скважина', well: 'Колодец', water_truck: 'Водовоз',
  spring: 'Родник', other: 'Другое',
}
const STATUS_LABELS = {
  active: 'Работает', broken: 'Сломана', abandoned: 'Заброшена',
}
const QUALITY_LABELS = {
  fresh: 'Пресная', slightly_saline: 'Слабосолёная', saline: 'Солёная',
  technical: 'Техническая', unknown: 'Неизвестно',
}
const STATUS_BADGE_COLORS = {
  active: { bg: '#dcfce7', text: '#166534' },
  broken: { bg: '#fee2e2', text: '#991b1b' },
  abandoned: { bg: '#f1f5f9', text: '#475569' },
}
const QUALITY_BADGE_COLORS = {
  fresh: { bg: '#dcfce7', text: '#166534' },
  slightly_saline: { bg: '#fef9c3', text: '#854d0e' },
  saline: { bg: '#ffedd5', text: '#9a3412' },
  technical: { bg: '#fee2e2', text: '#991b1b' },
  unknown: { bg: '#f1f5f9', text: '#475569' },
}
// Dark variants for sidebar cards
const STATUS_BADGE_DARK = {
  active: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
  broken: { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
  abandoned: { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8' },
}

function getMarkerColor(point) {
  if (point.status === 'abandoned') return '#94a3b8'
  if (point.status === 'broken') return '#ef4444'
  if (point.type === 'water_truck') return '#3b82f6'
  if (point.water_quality === 'fresh') return '#22c55e'
  if (point.water_quality === 'slightly_saline') return '#eab308'
  if (point.water_quality === 'saline' || point.water_quality === 'technical') return '#f97316'
  return '#94a3b8'
}

function createColorIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:26px;height:26px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.25);
      transition: transform 0.15s;
    "></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -16],
  })
}

function buildPopupHtml(p) {
  const color = getMarkerColor(p)
  const statusC = STATUS_BADGE_COLORS[p.status] || { bg: '#f1f5f9', text: '#475569' }
  const qualityC = QUALITY_BADGE_COLORS[p.water_quality] || { bg: '#f1f5f9', text: '#475569' }

  const badge = (label, bg, text) =>
    `<span style="display:inline-block;padding:2px 8px;border-radius:20px;background:${bg};color:${text};font-size:11px;font-weight:600;">${label}</span>`

  const row = (label, val) =>
    `<tr>
      <td style="color:#64748b;padding:3px 10px 3px 0;font-size:12px;white-space:nowrap;">${label}</td>
      <td style="color:#0f172a;font-size:12px;font-weight:500;">${val}</td>
    </tr>`

  return `
    <div style="font-family:'Inter',-apple-system,sans-serif;min-width:230px;max-width:290px;">
      <div style="background:linear-gradient(135deg,#0f172a 0%,#1e3a8a 100%);padding:12px 14px;display:flex;align-items:center;gap:8px;">
        <div style="width:11px;height:11px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.6);flex-shrink:0;"></div>
        <span style="font-weight:700;font-size:13px;color:white;line-height:1.3;">${p.name}</span>
      </div>
      <div style="padding:12px 14px;background:white;">
        <div style="display:flex;gap:5px;margin-bottom:10px;flex-wrap:wrap;">
          ${badge(STATUS_LABELS[p.status] || p.status, statusC.bg, statusC.text)}
          ${badge(QUALITY_LABELS[p.water_quality] || '—', qualityC.bg, qualityC.text)}
        </div>
        <table style="border-collapse:collapse;width:100%;">
          ${row('Тип', TYPE_LABELS[p.type] || p.type)}
          ${p.mineralization ? row('Минерал.', `${p.mineralization} г/л`) : ''}
          ${p.depth ? row('Глубина', `${p.depth} м`) : ''}
          ${p.balance_holder ? row('Баланс', p.balance_holder) : ''}
          ${p.district ? row('Район', p.district) : ''}
        </table>
        ${p.comment ? `<div style="margin-top:8px;padding-top:8px;border-top:1px solid #f1f5f9;font-size:11px;color:#64748b;line-height:1.5;">${p.comment}</div>` : ''}
        <div style="margin-top:8px;font-size:11px;color:#94a3b8;">📍 ${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}</div>
      </div>
    </div>
  `
}

function MarkerClusterGroup({ points }) {
  const map = useMap()
  const clusterRef = useRef(null)

  useEffect(() => {
    if (clusterRef.current) {
      map.removeLayer(clusterRef.current)
    }

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    })

    points.forEach(p => {
      const color = getMarkerColor(p)
      const marker = L.marker([p.latitude, p.longitude], {
        icon: createColorIcon(color),
      })
      marker.bindPopup(buildPopupHtml(p), { maxWidth: 300, className: '' })
      cluster.addLayer(marker)
    })

    map.addLayer(cluster)
    clusterRef.current = cluster

    return () => {
      if (clusterRef.current) {
        map.removeLayer(clusterRef.current)
      }
    }
  }, [map, points])

  return null
}

function LocateButton() {
  const map = useMap()
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')

  const handleLocate = () => {
    setLocating(true)
    setError('')
    map.locate({ setView: true, maxZoom: 12 })
    map.once('locationfound', () => setLocating(false))
    map.once('locationerror', () => {
      setLocating(false)
      setError('Не удалось определить местоположение')
    })
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end gap-1">
      <button
        onClick={handleLocate}
        className="backdrop-blur shadow-lg rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white flex items-center gap-1.5 border transition-all"
        style={{ background: 'rgba(26,46,59,0.92)', borderColor: '#2d4a5f' }}
        disabled={locating}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
        {locating ? 'Поиск...' : 'Где я?'}
      </button>
      {error && (
        <div style={{ color: '#f87171', fontSize: '12px', padding: '4px 10px', background: '#1a2e3b', border: '1px solid #2d4a5f', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', maxWidth: '200px', textAlign: 'right' }}>
          {error}
        </div>
      )}
    </div>
  )
}

const userLocationIcon = L.divIcon({
  className: '',
  html: `
    <div class="user-location-marker">
      <div class="user-location-ring"></div>
      <div class="user-location-dot"></div>
      <span class="user-location-label">You</span>
    </div>
  `,
  iconSize: [80, 20],
  iconAnchor: [8, 8],
})

function UserLocation() {
  const map = useMap()
  const markerRef = useRef(null)

  useEffect(() => {
    const onLocationFound = (e) => {
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }
      const marker = L.marker(e.latlng, { icon: userLocationIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup('Вы здесь')
      markerRef.current = marker
    }

    map.on('locationfound', onLocationFound)
    return () => {
      map.off('locationfound', onLocationFound)
      if (markerRef.current) map.removeLayer(markerRef.current)
    }
  }, [map])

  return null
}

// Sidebar point card
function PointCard({ point }) {
  const color = getMarkerColor(point)
  const statusC = STATUS_BADGE_DARK[point.status] || { bg: 'rgba(148,163,184,0.1)', text: '#94a3b8' }

  return (
    <div className="px-4 py-3 cursor-pointer transition-colors border-b"
      style={{ borderColor: '#2d4a5f' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,180,216,0.05)' }}
      onMouseLeave={e => { e.currentTarget.style.background = '' }}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 border-2 shadow-sm"
          style={{ background: color, borderColor: 'rgba(255,255,255,0.15)' }}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate leading-tight" style={{ color: '#e2edf5' }}>{point.name}</p>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-xs" style={{ color: '#7eb8cc' }}>{TYPE_LABELS[point.type] || point.type}</span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: statusC.bg, color: statusC.text }}
            >
              {STATUS_LABELS[point.status] || point.status}
            </span>
          </div>
          {point.district && (
            <p className="text-xs mt-0.5 truncate" style={{ color: '#5a8ea3' }}>{point.district}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="px-4 py-3 border-b" style={{ borderColor: '#2d4a5f' }}>
      <div className="flex items-start gap-2.5">
        <div className="skeleton w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  )
}

export default function MapPage({ apiBase, refreshKey }) {
  const [points, setPoints] = useState([])
  const [filters, setFilters] = useState({ type: '', status: '', water_quality: '' })
  const [loading, setLoading] = useState(true)

  const fetchPoints = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filters.type) params.set('type', filters.type)
    if (filters.status) params.set('status', filters.status)
    if (filters.water_quality) params.set('water_quality', filters.water_quality)
    try {
      const res = await fetch(`${apiBase}/points?${params}`)
      const data = await res.json()
      setPoints(data)
    } catch (err) {
      console.error('Failed to fetch points:', err)
    }
    setLoading(false)
  }, [apiBase, filters])

  useEffect(() => {
    fetchPoints()
  }, [fetchPoints, refreshKey])

  const center = [45.5, 52.5]
  const activeCount = points.filter(p => p.status === 'active').length

  return (
    <div className="flex flex-col md:flex-row h-full">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex flex-col w-80 flex-shrink-0 overflow-hidden border-r"
        style={{ background: '#1a2e3b', borderColor: '#2d4a5f' }}>

        {/* Stats header */}
        <div className="p-4 flex-shrink-0 border-b" style={{ background: '#0f1923', borderColor: '#2d4a5f' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#7eb8cc' }}>
            Обзор — Западный Казахстан
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl p-3 text-center border"
              style={{ background: 'rgba(0,180,216,0.07)', borderColor: 'rgba(0,180,216,0.2)', boxShadow: '0 0 12px rgba(0,180,216,0.1)' }}>
              <div className="text-2xl font-bold text-white">
                {loading ? <span className="skeleton inline-block w-8 h-7 rounded" /> : points.length}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#7eb8cc' }}>Всего точек</div>
            </div>
            <div className="rounded-xl p-3 text-center border"
              style={{ background: 'rgba(74,222,128,0.07)', borderColor: 'rgba(74,222,128,0.2)', boxShadow: '0 0 12px rgba(74,222,128,0.08)' }}>
              <div className="text-2xl font-bold" style={{ color: '#4ade80' }}>
                {loading ? <span className="skeleton inline-block w-8 h-7 rounded" /> : activeCount}
              </div>
              <div className="text-xs mt-0.5" style={{ color: '#7eb8cc' }}>Работают</div>
            </div>
          </div>
        </div>

        {/* Filters panel */}
        <FilterPanel filters={filters} setFilters={setFilters} />

        {/* Legend */}
        <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: '#2d4a5f' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#7eb8cc' }}>Легенда</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {[
              ['#22c55e', 'Пресная'],
              ['#eab308', 'Слабосолёная'],
              ['#f97316', 'Солёная'],
              ['#ef4444', 'Сломана'],
              ['#3b82f6', 'Водовоз'],
              ['#94a3b8', 'Заброшена'],
            ].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs" style={{ color: '#a0c4d4' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Points list */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarColor: '#2d4a5f #1a2e3b' }}>
          <div className="px-4 py-2 flex-shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#7eb8cc' }}>
              {loading ? 'Загрузка точек...' : `Точки (${points.length})`}
            </p>
          </div>

          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : points.length === 0
              ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2d4a5f', marginBottom: '12px' }}>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p className="text-sm font-semibold" style={{ color: '#a0c4d4' }}>Точки не найдены</p>
                  <p className="text-xs mt-1" style={{ color: '#5a8ea3' }}>Попробуйте изменить фильтры</p>
                </div>
              )
              : points.map(p => <PointCard key={p.id} point={p} />)
          }
        </div>
      </aside>

      {/* ── Map area ── */}
      <div className="flex-1 relative min-h-0" style={{ background: '#0f1923' }}>
        {/* Mobile floating filters */}
        <div className="md:hidden">
          <Filters filters={filters} setFilters={setFilters} />
        </div>

        <MapContainer
          center={center}
          zoom={6}
          className="h-full w-full"
          zoomControl={false}
          style={{ minHeight: '300px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
          />
          <MarkerClusterGroup points={points} />
          <LocateButton />
          <UserLocation />
          <NearestButton apiBase={apiBase} />
        </MapContainer>

        {/* Left edge vignette where sidebar meets map */}
        <div className="hidden md:block absolute top-0 left-0 w-10 h-full z-[999] pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(26,46,59,0.5), transparent)' }} />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 backdrop-blur px-4 py-2 rounded-full shadow-lg text-sm font-semibold z-[1000] flex items-center gap-2 border"
            style={{ background: 'rgba(26,46,59,0.92)', borderColor: '#2d4a5f', color: '#a0c4d4' }}>
            <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Загрузка...
          </div>
        )}

        {/* Mobile legend (bottom-right floating) */}
        <div className="md:hidden absolute bottom-20 right-3 backdrop-blur rounded-xl shadow-lg p-3 z-[1000] border"
          style={{ background: 'rgba(26,46,59,0.92)', borderColor: '#2d4a5f' }}>
          <div className="flex flex-col gap-1.5">
            {[
              ['#22c55e', 'Пресная'],
              ['#ef4444', 'Сломана'],
              ['#3b82f6', 'Водовоз'],
              ['#94a3b8', 'Заброшена'],
            ].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="text-xs" style={{ color: '#a0c4d4' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
