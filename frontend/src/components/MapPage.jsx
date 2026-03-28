import { useState, useEffect, useRef, useCallback } from 'react'
import {
  MapContainer, TileLayer, useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import Filters from './Filters'
import PointPopup from './PointPopup'
import NearestButton from './NearestButton'

// Fix default marker icon issue in webpack/vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const STATUS_COLORS = {
  active: '#22c55e',
  broken: '#ef4444',
  abandoned: '#6b7280',
}

const QUALITY_COLORS = {
  fresh: '#22c55e',
  slightly_saline: '#eab308',
  saline: '#f97316',
  technical: '#ef4444',
  unknown: '#6b7280',
}

function createColorIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  })
}

function getMarkerColor(point) {
  if (point.status === 'abandoned') return '#6b7280'
  if (point.status === 'broken') return '#ef4444'
  if (point.type === 'water_truck') return '#3b82f6'
  if (point.water_quality === 'fresh') return '#22c55e'
  if (point.water_quality === 'slightly_saline') return '#eab308'
  if (point.water_quality === 'saline' || point.water_quality === 'technical') return '#eab308'
  return '#6b7280'
}

// Cluster layer component
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
      const typeLabels = {
        borehole: 'Скважина', well: 'Колодец', water_truck: 'Водовоз',
        spring: 'Родник', other: 'Другое',
      }
      const statusLabels = {
        active: '✅ Работает', broken: '🔧 Сломана', abandoned: '⛔ Заброшена',
      }
      const qualityLabels = {
        fresh: 'Пресная', slightly_saline: 'Слабосолёная', saline: 'Солёная',
        technical: 'Техническая', unknown: 'Неизвестно',
      }
      marker.bindPopup(`
        <div style="min-width:220px;font-family:sans-serif;">
          <h3 style="margin:0 0 8px;font-size:15px;color:#1e40af;">${p.name}</h3>
          <table style="font-size:13px;line-height:1.6;border-collapse:collapse;">
            <tr><td style="color:#666;padding-right:8px;">Тип</td><td><b>${typeLabels[p.type] || p.type}</b></td></tr>
            <tr><td style="color:#666;padding-right:8px;">Статус</td><td>${statusLabels[p.status] || p.status}</td></tr>
            <tr><td style="color:#666;padding-right:8px;">Качество</td><td>${qualityLabels[p.water_quality] || '—'}</td></tr>
            ${p.mineralization ? `<tr><td style="color:#666;padding-right:8px;">Минерал.</td><td>${p.mineralization} г/л</td></tr>` : ''}
            ${p.depth ? `<tr><td style="color:#666;padding-right:8px;">Глубина</td><td>${p.depth} м</td></tr>` : ''}
            ${p.balance_holder ? `<tr><td style="color:#666;padding-right:8px;">Баланс</td><td>${p.balance_holder}</td></tr>` : ''}
            ${p.district ? `<tr><td style="color:#666;padding-right:8px;">Район</td><td>${p.district}</td></tr>` : ''}
          </table>
          ${p.comment ? `<p style="margin:8px 0 0;font-size:12px;color:#555;border-top:1px solid #eee;padding-top:6px;">${p.comment}</p>` : ''}
          <p style="margin:4px 0 0;font-size:11px;color:#999;">📍 ${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}</p>
        </div>
      `, { maxWidth: 300 })
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

// Geolocation button
function LocateButton() {
  const map = useMap()
  const [locating, setLocating] = useState(false)

  const handleLocate = () => {
    setLocating(true)
    map.locate({ setView: true, maxZoom: 12 })
    map.once('locationfound', () => setLocating(false))
    map.once('locationerror', () => {
      setLocating(false)
      alert('Не удалось определить местоположение')
    })
  }

  return (
    <button
      onClick={handleLocate}
      className="absolute top-4 right-4 z-[1000] bg-white shadow-lg rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50 flex items-center gap-1"
      disabled={locating}
    >
      📍 {locating ? 'Поиск...' : 'Где я?'}
    </button>
  )
}

// User location marker with pulsing animation and "You" label
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

  // Center on western Kazakhstan
  const center = [45.5, 52.5]

  return (
    <div className="relative h-full">
      <Filters filters={filters} setFilters={setFilters} />

      <div className="h-full pb-14 md:pb-0">
        <MapContainer
          center={center}
          zoom={6}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MarkerClusterGroup points={points} />
          <LocateButton />
          <UserLocation />
          <NearestButton apiBase={apiBase} />
        </MapContainer>
      </div>

      {loading && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-white/90 px-4 py-2 rounded-full shadow text-sm z-[1000]">
          Загрузка...
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-16 md:bottom-4 left-4 bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 z-[1000] text-xs">
        <div className="font-semibold mb-1 text-gray-700">Легенда</div>
        <div className="flex flex-col gap-0.5">
          <span><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>Пресная / Работает</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>Солёная / Техническая</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>Сломана</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>Водовоз</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-gray-500 mr-1"></span>Заброшена</span>
        </div>
      </div>
    </div>
  )
}
