import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import MapPage from './components/MapPage'
import AddPointForm from './components/AddPointForm'
import Dashboard from './components/Dashboard'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0)
  const triggerRefresh = () => setRefreshKey(k => k + 1)

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<MapPage apiBase={API_BASE} refreshKey={refreshKey} />} />
          <Route path="/add" element={<AddPointForm apiBase={API_BASE} onAdded={triggerRefresh} />} />
          <Route path="/dashboard" element={<Dashboard apiBase={API_BASE} />} />
        </Routes>
      </main>
    </div>
  )
}
