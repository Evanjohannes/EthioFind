import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../lib/leafletSetup'

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points.map((p) => [p.lat, p.lng]), { padding: [40, 40], maxZoom: 16 })
    else if (points.length === 1) map.setView([points[0].lat, points[0].lng], 16)
  }, [points, map])
  return null
}

export default function LocationsMap({ points }) {
  if (points.length === 0) return null

  return (
    <div className="h-56 rounded-2xl overflow-hidden border border-brand-100 relative z-0">
      <MapContainer center={[points[0].lat, points[0].lng]} zoom={15} className="h-full w-full">
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {points.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <div className="font-semibold">{p.label}</div>
              {p.address && <div className="text-xs">{p.address}</div>}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium"
              >
                Get directions →
              </a>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}