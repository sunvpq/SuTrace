import { useState } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export default function NearestButton({ apiBase }) {
  const map = useMap()
  const [searching, setSearching] = useState(false)
  const [line, setLine] = useState(null)

  const handleClick = () => {
    setSearching(true)
    if (line) {
      map.removeLayer(line)
      setLine(null)
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `${apiBase}/points/nearest?lat=${latitude}&lon=${longitude}&quality=fresh`
          )
          if (!res.ok) {
            alert('Пресные источники не найдены')
            setSearching(false)
            return
          }
          const point = await res.json()
          const distKm = (point.distance_m / 1000).toFixed(1)

          const newLine = L.polyline(
            [[latitude, longitude], [point.latitude, point.longitude]],
            { color: '#22c55e', weight: 3, dashArray: '8 8', opacity: 0.8 }
          ).addTo(map)
          setLine(newLine)

          map.fitBounds(newLine.getBounds().pad(0.3))

          L.popup()
            .setLatLng([point.latitude, point.longitude])
            .setContent(`
              <div style="font-family:'Inter',sans-serif;padding:4px 0;">
                <div style="font-weight:700;color:#166534;font-size:13px;margin-bottom:4px;">Ближайшая пресная вода</div>
                <div style="font-weight:600;color:#0f172a;font-size:13px;">${point.name}</div>
                <div style="color:#64748b;font-size:12px;margin-top:3px;">📏 ${distKm} км от вас</div>
              </div>
            `)
            .openOn(map)
        } catch (err) {
          alert('Ошибка поиска: ' + err.message)
        }
        setSearching(false)
      },
      () => {
        alert('Не удалось определить местоположение')
        setSearching(false)
      }
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={searching}
      className="absolute top-16 right-4 z-[1000] bg-green-500 text-white shadow-lg rounded-xl px-3.5 py-2.5 text-sm font-semibold hover:bg-green-600 flex items-center gap-1.5 border border-green-400 disabled:opacity-50 transition-all"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      {searching ? 'Поиск...' : 'Ближайшая вода'}
    </button>
  )
}
