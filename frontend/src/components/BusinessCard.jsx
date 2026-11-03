import { useNavigate } from 'react-router-dom'
import { photoUrl } from '../lib/photos'
import { formatDistance } from '../lib/distance'
import Icon from './Icons'

export default function BusinessCard({ listing, saved, onToggleSave }) {
  const navigate = useNavigate()
  const place = [listing.address_text, listing.subcity, listing.city].filter(Boolean).join(', ')

  return (
    <div
      onClick={() => navigate(listing.is_branch ? `/branch/${listing.listing_id}` : `/business/${listing.business_id}`)}
      className="flex gap-4 bg-surface rounded-3xl p-3 shadow-card border border-brand-400/40 cursor-pointer hover:shadow-soft transition"
    >
      {listing.cover ? (
        <img
          src={photoUrl(listing.cover)}
          alt=""
          loading="lazy"
          className="w-24 h-24 rounded-2xl object-cover shrink-0"
        />
      ) : (
        <div className="w-24 h-24 rounded-2xl bg-linear-to-br from-brand-400 to-brand-700 text-white flex items-center justify-center shrink-0">
          <Icon name="store" className="w-8 h-8" />
        </div>
      )}

      <div className="flex-1 min-w-0 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-brand-950 leading-snug truncate">{listing.name}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleSave?.(listing.business_id)
            }}
            className="text-brand-900 shrink-0"
            aria-label="Save"
          >
            <Icon name="heart" filled={saved} />
          </button>
        </div>

        {listing.is_branch && (
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold bg-brand-900 text-white px-2 py-0.5 rounded-full">
            <Icon name="layers" className="w-3 h-3" /> Branch{listing.branch_label ? ` · ${listing.branch_label}` : ''}
          </span>
        )}

        <p className="text-xs font-medium text-brand-700 mt-1">{listing.category_name}</p>

        <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
          <Icon name="pin" className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{place || '—'}</span>
        </div>

        <div className="flex items-center gap-3 mt-1.5 text-xs">
          {listing.rating_count > 0 && (
            <span className="flex items-center gap-1 font-semibold text-brand-950">
              <Icon name="star" className="w-3.5 h-3.5 text-amber-500" filled /> {listing.rating_avg}
            </span>
          )}
          {listing.distanceKm != null && (
            <span className="font-semibold text-brand-700">{formatDistance(listing.distanceKm)} away</span>
          )}
        </div>
      </div>
    </div>
  )
}