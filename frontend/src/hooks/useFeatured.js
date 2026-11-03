import { useMemo } from 'react'
import { useBusinesses } from './useBusinesses'
import { distanceKm } from '../lib/distance'

export function useFeatured(location) {
  const { businesses, loading } = useBusinesses()

  const slides = useMemo(() => {
    const mains = businesses
      .filter((b) => !b.is_branch)
      .map((b) => ({
        ...b,
        distanceKm: location && b.lat != null ? distanceKm(location, { lat: b.lat, lng: b.lng }) : null,
      }))

    const top = [...mains]
      .filter((b) => b.rating_count > 0)
      .sort((a, b) => b.rating_avg - a.rating_avg || b.rating_count - a.rating_count)
      .slice(0, 3)
      .map((b) => ({ ...b, tag: 'Top rated' }))

    const near = location
      ? [...mains]
          .filter((b) => b.distanceKm != null)
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 3)
          .map((b) => ({ ...b, tag: 'Near you' }))
      : []

    // mix them: near, top, near, top...
    const mixed = []
    const seen = new Set()
    for (let i = 0; i < Math.max(top.length, near.length); i++) {
      for (const list of [near, top]) {
        const item = list[i]
        if (item && !seen.has(item.business_id)) {
          seen.add(item.business_id)
          mixed.push(item)
        }
      }
    }

    // nothing rated and no location yet: show the newest businesses
    if (mixed.length === 0) {
      return mains.slice(0, 4).map((b) => ({ ...b, tag: 'New' }))
    }
    return mixed.slice(0, 6)
  }, [businesses, location])

  return { slides, loading }
}