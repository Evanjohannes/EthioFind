import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { photoUrl } from '../lib/photos'
import { formatDistance } from '../lib/distance'
import Icon from './Icons'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function HeroCarousel({ slides }) {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const count = slides.length
  const safeIndex = count ? index % count : 0
  const current = count ? slides[safeIndex] : null

  // change slide every 5 seconds (tapping a dot restarts the timer)
  useEffect(() => {
    if (count < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), 1500)
    return () => clearInterval(timer)
  }, [count, index])

  const place = current
    ? [current.address_text, current.subcity, current.city].filter(Boolean).join(', ')
    : ''

  return (
    <div className="relative h-48 md:h-64 overflow-hidden rounded-3xl bg-brand-950 text-white shadow-soft">
      {count === 0 && (
        <div className="absolute inset-0 bg-linear-to-br from-brand-950 via-brand-900 to-brand-700" />
      )}

      {slides.map((s, i) => (
        <div
          key={s.listing_id}
          className={`absolute inset-0 transition-opacity duration-600 ${
            i === safeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {s.cover ? (
            <img src={photoUrl(s.cover)} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-brand-900 to-brand-700" />
          )}
        </div>
      ))}

      <div className="absolute inset-0 bg-linear-to-t from-brand-950/90 via-brand-950/30 to-brand-950/30" />

      <div className="absolute top-4 inset-x-5 md:inset-x-8 flex items-center justify-between">
        {current ? (
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
            <Icon
              name={current.tag === 'Near you' ? 'navigation' : 'star'}
              className="w-3.5 h-3.5"
              filled={current.tag === 'Top rated'}
            />
            {current.tag}
          </span>
        ) : (
          <span />
        )}
        <span className="text-xs md:text-sm text-white/80">{greeting()}</span>
      </div>

      {current && (
        <button
          key={current.listing_id}
          onClick={() => navigate(`/business/${current.business_id}`)}
          className="absolute bottom-4 inset-x-0 pl-5 pr-24 md:pl-8 text-left animate-fade-up"
        >
          <span className="block text-xl md:text-3xl font-bold leading-tight truncate">{current.name}</span>

          {place && (
            <span className="flex items-center gap-1.5 text-sm text-brand-400 mt-0.5">
              <Icon name="pin" className="w-4 h-4 shrink-0" />
              <span className="truncate">{place}</span>
            </span>
          )}

          <span className="flex items-center gap-3 text-xs md:text-sm mt-1 text-white/90">
            <span>{current.category_name}</span>
            {current.rating_count > 0 && (
              <span className="flex items-center gap-1 font-semibold">
                <Icon name="star" className="w-3.5 h-3.5 text-amber-400" filled /> {current.rating_avg}
              </span>
            )}
            {current.distanceKm != null && <span>{formatDistance(current.distanceKm)} away</span>}
          </span>
        </button>
      )}

      {count > 1 && (
        <div className="absolute bottom-5 right-5 md:right-8 flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.listing_id}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === safeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}