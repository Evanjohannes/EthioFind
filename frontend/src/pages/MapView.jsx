import { useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../lib/leafletSetup'
import { useBusinesses } from '../hooks/useBusinesses'
import Icon from '../components/Icons'

const ADDIS_ABABA = [9.0107, 38.7468]

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 0) map.fitBounds(points, { padding: [40, 40], maxZoom: 16 })
  }, [points, map])
  return null
}

export default function MapView() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { businesses: all } = useBusinesses()

  // use the list from Discover (so filters carry over), otherwise show everything
  const items = useMemo(
    () => (state?.businesses ?? all).filter((b) => b.lat != null && b.lng != null),
    [state, all]
  )
  const points = useMemo(() => items.map((b) => [b.lat, b.lng]), [items])

  return (
    <div className="max-w-md md:max-w-5xl mx-auto h-screen flex flex-col pb-24">
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-surface shadow-card border border-brand-400/40 flex items-center justify-center text-brand-950"
        >
          <Icon name="back" />
        </button>
        <h1 className="text-xl font-bold text-brand-950">Map</h1>
        <span className="text-sm text-text-muted">{items.length} places</span>
      </div>

      <div className="flex-1 relative z-0 mx-5 rounded-3xl overflow-hidden border border-brand-400/40 shadow-card">
        <MapContainer center={ADDIS_ABABA} zoom={12} className="h-full w-full">
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
          {items.map((b) => (
            <Marker key={b.listing_id} position={[b.lat, b.lng]}>
              <Popup>
                <div className="font-semibold">{b.name}</div>
                {b.is_branch && b.branch_label && <div className="text-xs">{b.branch_label}</div>}
                <div className="text-xs">{b.category_name}</div>
                <Link to={b.is_branch ? `/branch/${b.listing_id}` : `/business/${b.business_id}`} className="text-sm font-medium">
                  View details →
                </Link>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}