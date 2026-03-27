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

          // Draw line from user to nearest point
          const newLine = L.polyline(
            [[latitude, longitude], [point.latitude, point.longitude]],
            { color: '#22c55e', weight: 3, dashArray: '8 8' }
          ).addTo(map)
          setLine(newLine)

          // Fit bounds to show both points
          map.fitBounds(newLine.getBounds().pad(0.3))

          // Show popup at the point
          L.popup()
            .setLatLng([point.latitude, point.longitude])
            .setContent(`
              <div style="font-family:sans-serif;">
                <b style="color:#22c55e;">Ближайшая пресная вода</b><br/>
                <b>${point.name}</b><br/>
                📏 ${distKm} км от вас
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
      className="absolute top-16 right-4 z-[1000] bg-green-500 text-white shadow-lg rounded-lg px-3 py-2 text-sm font-medium hover:bg-green-600 flex items-center gap-1 disabled:opacity-50"
    >
      💧 {searching ? 'Поиск...' : 'Ближайшая вода'}
    </button>
  )
}
