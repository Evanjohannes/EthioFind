import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Page from '../components/Page'
import SearchBar from '../components/SearchBar'
import HeroCarousel from '../components/HeroCarousel'
import CategoryChip from '../components/CategoryChip'
import BusinessCard from '../components/BusinessCard'
import FilterSheet from '../components/FilterSheet'
import Icon from '../components/Icons'
import { useCategories } from '../hooks/useCategories'
import { useAllCategories } from '../hooks/useAllCategories'
import { useBusinesses } from '../hooks/useBusinesses'
import { useFeatured } from '../hooks/useFeatured'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { useUserLocation } from '../hooks/useUserLocation'
import { useSaved } from '../hooks/useSaved'
import { distanceKm } from '../lib/distance'

export default function Discover() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [city, setCity] = useState('')
  const [topRated, setTopRated] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)

  const { categories } = useCategories()
  const allCategories = useAllCategories()
  const { history, addSearch, removeSearch, clearAll } = useSearchHistory()
  const { savedIds, toggleSave } = useSaved()
  const { location, status: locationStatus, request: requestLocation } = useUserLocation()
  const { slides } = useFeatured(location)

  // selecting "Food & Drink" also includes Cafe, Restaurant, etc.
  const categoryIds = useMemo(() => {
    if (!activeCategory) return null
    const children = allCategories
      .filter((c) => c.parent_category_id === activeCategory)
      .map((c) => c.id)
    return [activeCategory, ...children]
  }, [activeCategory, allCategories])

  const { businesses, loading } = useBusinesses({ search, categoryIds, city, topRated })

  const sortedBusinesses = useMemo(() => {
    if (!location) return businesses
    const withDistance = businesses.map((b) => ({
      ...b,
      distanceKm: b.lat != null ? distanceKm(location, { lat: b.lat, lng: b.lng }) : null,
    }))
    if (topRated) return withDistance
    return withDistance.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
  }, [businesses, location, topRated])

  const showHistory = searchFocused && !search && history.length > 0
  const hasFilters = search || activeCategory || city || topRated

  function resetFilters() {
    setCity('')
    setTopRated(false)
    setActiveCategory(null)
  }

  async function handleToggle(businessId) {
    const result = await toggleSave(businessId)
    if (result.needsAuth) navigate('/signup')
  }

  return (
    <Page wide>
      <SearchBar
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFilterClick={() => setFilterOpen(true)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
        onSubmit={() => addSearch(search)}
      />

      {showHistory && (
        <div className="bg-surface border border-brand-400/40 rounded-2xl mt-3 p-4 shadow-card">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-semibold text-brand-950">Recent searches</span>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={clearAll}
              className="text-xs text-brand-700 font-semibold"
            >
              Clear all
            </button>
          </div>
          {history.map((h) => (
            <div key={h.id} className="flex items-center justify-between py-2">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setSearch(h.query_text); addSearch(h.query_text) }}
                className="flex items-center gap-3 text-sm text-text text-left flex-1"
              >
                <Icon name="clock" className="w-4 h-4 text-brand-700" /> {h.query_text}
              </button>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => removeSearch(h.id)}
                className="text-text-muted p-1"
              >
                <Icon name="x" className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!search && (
        <div className="mt-4">
          <HeroCarousel slides={slides} />
        </div>
      )}

      <h2 className="text-lg font-bold text-brand-950 mt-7 mb-3">Categories</h2>
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap pb-1">
        {categories.map((cat) => (
          <CategoryChip
            key={cat.id}
            label={cat.name}
            icon={cat.icon}
            active={activeCategory === cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
          />
        ))}
      </div>

      <div className="flex justify-between items-center mt-7 mb-3">
        <h2 className="text-lg font-bold text-brand-950">
          {hasFilters ? 'Results' : location ? 'Nearby' : 'All businesses'}
          <span className="text-sm font-medium text-text-muted ml-2">{sortedBusinesses.length}</span>
        </h2>
        <div className="flex items-center gap-4">
          {hasFilters && (
            <button
              onClick={() => { setSearch(''); resetFilters() }}
              className="text-sm text-brand-700 font-semibold"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => navigate('/map', { state: { businesses: sortedBusinesses } })}
            className="flex items-center gap-1 text-sm text-brand-700 font-semibold"
          >
            <Icon name="map" className="w-4 h-4" /> Map
          </button>
        </div>
      </div>

      {locationStatus === 'denied' && (
        <div className="bg-brand-400/30 rounded-2xl p-3 mb-3 flex items-center justify-between gap-2">
          <span className="text-sm text-brand-900">Turn on location to see what's near you</span>
          <button onClick={requestLocation} className="text-sm font-semibold text-brand-900 underline shrink-0">
            Enable
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-text-muted text-sm">Loading...</p>
      ) : sortedBusinesses.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
            <Icon name="search" className="w-6 h-6" />
          </div>
          <p className="text-text-muted">No businesses found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedBusinesses.map((b) => (
            <BusinessCard
              key={b.listing_id}
              listing={b}
              saved={savedIds.has(b.business_id)}
              onToggleSave={handleToggle}
            />
          ))}
        </div>
      )}

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        city={city}
        setCity={setCity}
        topRated={topRated}
        setTopRated={setTopRated}
        onReset={resetFilters}
      />
    </Page>
  )
}