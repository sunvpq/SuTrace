import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
    },
  })
  return position ? <Marker position={position} /> : null
}

const INITIAL = {
  name: '',
  type: 'borehole',
  status: 'active',
  water_quality: 'unknown',
  mineralization: '',
  depth: '',
  balance_holder: '',
  latitude: '',
  longitude: '',
  district: '',
  region: '',
  comment: '',
  added_by: '',
}

export default function AddPointForm({ apiBase, onAdded }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL)
  const [mapPos, setMapPos] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [locating, setLocating] = useState(false)

  // Sync map marker -> form fields
  useEffect(() => {
    if (mapPos) {
      setForm(f => ({
        ...f,
        latitude: mapPos[0].toFixed(6),
        longitude: mapPos[1].toFixed(6),
      }))
    }
  }, [mapPos])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    // Sync lat/lon back to map marker
    if (name === 'latitude' || name === 'longitude') {
      const lat = name === 'latitude' ? parseFloat(value) : parseFloat(form.latitude)
      const lon = name === 'longitude' ? parseFloat(value) : parseFloat(form.longitude)
      if (!isNaN(lat) && !isNaN(lon)) setMapPos([lat, lon])
    }
  }

  const handleGeolocate = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setMapPos([latitude, longitude])
        setLocating(false)
      },
      () => {
        alert('Не удалось определить местоположение')
        setLocating(false)
      }
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.latitude || !form.longitude) {
      setError('Укажите координаты — кликните по карте или нажмите "Определить"')
      return
    }
    setSubmitting(true)
    try {
      const body = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        mineralization: form.mineralization ? parseFloat(form.mineralization) : null,
        depth: form.depth ? parseFloat(form.depth) : null,
        added_by: form.added_by || 'anonymous',
      }
      const res = await fetch(`${apiBase}/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error(await res.text())
      setSuccess(true)
      onAdded?.()
      setTimeout(() => navigate('/'), 1500)
    } catch (err) {
      setError('Ошибка: ' + err.message)
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-lg font-semibold text-gray-800">Точка добавлена!</p>
          <p className="text-sm text-gray-500">Возвращаемся на карту...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto pb-16 md:pb-0">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h2 className="text-xl font-bold text-gray-800 mb-5">Добавить водную точку</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Map picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Координаты — кликните по карте или введите вручную
            </label>
            <div className="h-48 rounded-lg overflow-hidden border border-gray-300 mb-2">
              <MapContainer
                center={mapPos || [45.5, 52.5]}
                zoom={mapPos ? 10 : 6}
                className="h-full w-full"
                zoomControl={true}
              >
                <TileLayer
                  attribution='&copy; OSM'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapPicker position={mapPos} setPosition={setMapPos} />
              </MapContainer>
            </div>
            <div className="flex gap-2">
              <input
                name="latitude"
                value={form.latitude}
                onChange={handleChange}
                placeholder="Широта"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
              <input
                name="longitude"
                value={form.longitude}
                onChange={handleChange}
                placeholder="Долгота"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
              <button
                type="button"
                onClick={handleGeolocate}
                disabled={locating}
                className="px-3 py-2 bg-primary-700 text-white rounded-md text-sm hover:bg-primary-800 disabled:opacity-50 whitespace-nowrap"
              >
                {locating ? '...' : '📍 Определить'}
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Например: Скважина Кульсары-1"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="borehole">Скважина</option>
                <option value="well">Колодец</option>
                <option value="water_truck">Водовоз</option>
                <option value="spring">Родник</option>
                <option value="other">Другое</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус *</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="active">Работает</option>
                <option value="broken">Сломана</option>
                <option value="abandoned">Заброшена</option>
              </select>
            </div>
          </div>

          {/* Water quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Качество воды</label>
            <select
              name="water_quality"
              value={form.water_quality}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="fresh">Пресная (&lt;1 г/л)</option>
              <option value="slightly_saline">Слабосолёная (1–3 г/л)</option>
              <option value="saline">Солёная (&gt;3 г/л)</option>
              <option value="technical">Техническая</option>
              <option value="unknown">Неизвестно</option>
            </select>
          </div>

          {/* Mineralization + Depth */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Минерализация, г/л</label>
              <input
                name="mineralization"
                type="number"
                step="0.1"
                min="0"
                value={form.mineralization}
                onChange={handleChange}
                placeholder="Например: 2.5"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Глубина, м</label>
              <input
                name="depth"
                type="number"
                step="0.1"
                min="0"
                value={form.depth}
                onChange={handleChange}
                placeholder="Например: 120"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* District + Region */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Район</label>
              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="Жылыойский"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Область</label>
              <select
                name="region"
                value={form.region}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">— выберите —</option>
                <option value="Атырауская">Атырауская</option>
                <option value="Мангистауская">Мангистауская</option>
              </select>
            </div>
          </div>

          {/* Balance holder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">На чьём балансе</label>
            <input
              name="balance_holder"
              value={form.balance_holder}
              onChange={handleChange}
              placeholder="Акимат / ТОО / физлицо..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Комментарий</label>
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              rows={3}
              placeholder="Дополнительная информация..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
            />
          </div>

          {/* Added by */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ваше имя (необязательно)</label>
            <input
              name="added_by"
              value={form.added_by}
              onChange={handleChange}
              placeholder="Аноним"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 border border-gray-300 rounded-lg py-3 text-sm font-medium hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary-700 text-white rounded-lg py-3 text-sm font-semibold hover:bg-primary-800 disabled:opacity-50"
            >
              {submitting ? 'Сохранение...' : 'Добавить точку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
