import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import '../lib/leafletSetup'

const ADDIS_ABABA = [9.0107, 38.7468]

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

function Recenter({ value }) {
  const map = useMap()
  useEffect(() => {
    if (value) map.flyTo([value.lat, value.lng], Math.max(map.getZoom(), 15))
  }, [value, map])
  return null
}

export default function LocationPicker({ value, onChange }) {
  function useMyLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert('Could not get your location. Tap the map to place the pin instead.')
    )
  }

  return (
    <div>
      <p className="text-sm text-text-muted mb-2">
        Tap the map to place a pin on your business location
      </p>
      <div className="h-64 rounded-2xl overflow-hidden border border-brand-100 relative z-0">
        <MapContainer center={ADDIS_ABABA} zoom={13} className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={onChange} />
          <Recenter value={value} />
          {value && <Marker position={[value.lat, value.lng]} />}
        </MapContainer>
      </div>
      <button
        type="button"
        onClick={useMyLocation}
        className="text-sm text-brand-700 font-medium mt-2"
      >
        📍 Use my current location
      </button>
    </div>
  )
}