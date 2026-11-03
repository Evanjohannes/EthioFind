import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBusiness } from '../hooks/useBusiness'
import { useSaved } from '../hooks/useSaved'
import CoverSlider from '../components/CoverSlider'
import RatingSection from '../components/RatingSection'
import LocationsMap from '../components/LocationsMap'
import Icon from '../components/Icons'
import { href, shown, directions, isExternal } from '../lib/contact'


const CHIPS = [
  ['email', 'mail'],
  ['telegram', 'send'],
  ['tiktok', 'tiktok'],
  ['website', 'globe'],
]


const heading = 'text-sm font-semibold tracking-wide uppercase text-brand-700 mb-3'

const circleBtn =
  'w-10 h-10 rounded-full bg-white/90 backdrop-blur text-brand-950 flex items-center justify-center shadow-card'

export default function BusinessProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { business, branches, photos, loading, reload } = useBusiness(id)
  const { savedIds, toggleSave } = useSaved()
  const [toast, setToast] = useState('')

  if (loading) return <p className="p-5 text-text-muted">Loading...</p>
  if (!business) return <p className="p-5 text-text-muted">Business not found.</p>

  const hasPin = business.lat != null
  const address = [business.address_text, business.subcity, business.city].filter(Boolean).join(', ')

  const chips = CHIPS.filter(([k]) => business[k]).map(([k, icon]) => ({
    key: k,
    icon,
    value: shown(k, business[k]),
    url: href(k, business[k]),
  }))

  const points = [
    ...(hasPin
      ? [{ id: 'main', label: 'Main location', lat: business.lat, lng: business.lng, address: business.address_text }]
      : []),
    ...branches
      .filter((b) => b.lat != null)
      .map((b) => ({ id: b.id, label: b.label || 'Branch', lat: b.lat, lng: b.lng, address: b.address_text })),
  ]

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(''), 2200)
  }

  async function handleShare() {
    const url = `${window.location.origin}/business/${business.id}`
    const text = address ? `${business.name} — ${address}` : business.name

    if (navigator.share) {
      try {
        await navigator.share({ title: business.name, text, url })
      } catch {
        // user closed the share sheet
      }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copied')
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  async function handleSave() {
    const result = await toggleSave(business.id)
    if (result.needsAuth) navigate('/signup')
  }

  return (
    <div className="max-w-md md:max-w-3xl mx-auto pb-28 md:pt-6">
      <CoverSlider business={business} photos={photos}>
        <button onClick={() => navigate(-1)} className={circleBtn} aria-label="Back">
          <Icon name="back" />
        </button>
        <div className="flex gap-2">
          <button onClick={handleShare} className={circleBtn} aria-label="Share">
            <Icon name="share" />
          </button>
          <button onClick={handleSave} className={circleBtn} aria-label="Save">
            <Icon name="heart" filled={savedIds.has(business.id)} />
          </button>
        </div>
      </CoverSlider>

      <div className="relative -mt-8 bg-bg rounded-t-[2rem] px-5 pt-6">
        <h1 className="text-[1.65rem] font-bold text-brand-950 leading-tight">{business.name}</h1>

        {address && (
          <p className="flex items-start gap-1.5 text-text-muted mt-1.5">
            <Icon name="pin" className="w-4 h-4 mt-0.5 shrink-0 text-brand-700" />
            <span>{address}</span>
          </p>
        )}

        <div className="flex items-center gap-3 mt-3 text-sm">
          {business.categories?.name && (
            <span className="bg-brand-400/40 text-brand-900 font-semibold px-3 py-1 rounded-full text-xs">
              {business.categories.name}
            </span>
          )}
          {business.rating_count > 0 ? (
            <span className="flex items-center gap-1 font-semibold text-brand-950">
              <Icon name="star" className="w-4 h-4 text-amber-500" filled />
              {business.rating_avg}
              <span className="text-text-muted font-normal">({business.rating_count})</span>
            </span>
          ) : (
            <span className="text-text-muted">No ratings yet</span>
          )}
        </div>

        {(business.phone || hasPin) && (
          <div className="flex gap-3 mt-5">
            {business.phone && (
              <a
                href={href('phone', business.phone)}
                className="flex-1 flex items-center justify-center gap-2.5 bg-linear-to-br from-brand-900 to-brand-950 text-white rounded-full py-3.5 shadow-soft font-semibold active:scale-[0.99] transition"
              >
                <Icon name="phone" className="w-5 h-5" />
                <span>Call</span>
                <span className="text-brand-400">·</span>
                <span className="font-medium">{business.phone}</span>
              </a>
            )}
            {hasPin && (
              <a
                href={directions(business.lat, business.lng)}
                target="_blank"
                rel="noreferrer"
                aria-label="Directions"
                className={`flex items-center justify-center gap-2 rounded-full font-semibold transition ${
                  business.phone
                    ? 'w-14 bg-brand-400/40 text-brand-900 hover:bg-brand-400/70'
                    : 'flex-1 py-3.5 bg-linear-to-br from-brand-900 to-brand-950 text-white shadow-soft'
                }`}
              >
                <Icon name="navigation" className="w-5 h-5" />
                {!business.phone && <span>Directions</span>}
              </a>
            )}
          </div>
        )}

        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {chips.map((c) => (
              <a
                key={c.key}
                href={c.url}
                target={isExternal(c.url) ? '_blank' : undefined}
                rel="noreferrer"
                className="inline-flex items-center gap-2 max-w-full bg-surface border border-brand-400/60 text-brand-900 rounded-full pl-3 pr-4 py-2 text-sm font-medium hover:bg-brand-100 transition"
              >
                <Icon name={c.icon} className="w-4 h-4 shrink-0 text-brand-700" />
                <span className="truncate">{c.value}</span>
              </a>
            ))}
          </div>
        )}

        {business.description && (
          <div className="mt-7">
            <h2 className={heading}>About</h2>
            <p className="text-text leading-relaxed">{business.description}</p>
          </div>
        )}

        {branches.length > 0 && (
          <div className="mt-8">
            <h2 className={heading}>Branches · {branches.length}</h2>
            <div className="flex flex-col gap-3">
              {branches.map((br) => {
                const addr = [br.address_text, br.subcity, br.city].filter(Boolean).join(', ')
                return (
                  <div
                    key={br.id}
                    onClick={() => navigate(`/branch/${br.id}`)}
                    className="flex items-center gap-3 bg-surface rounded-3xl p-4 shadow-card border border-brand-400/40 cursor-pointer hover:shadow-soft transition"
                  >
                    <span className="w-11 h-11 rounded-2xl bg-linear-to-br from-brand-900 to-brand-950 text-white flex items-center justify-center shrink-0">
                      <Icon name="layers" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-950 truncate">Branch {br.branch_number}{br.label ? ` · ${br.label}` : ''}</h3>
                      {addr && <p className="text-sm text-text-muted truncate">{addr}</p>}
                      {br.phone && <p className="text-sm font-medium text-brand-900">{br.phone}</p>}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      {br.phone && (
                        <a
                          href={href('phone', br.phone)}
                          aria-label="Call branch"
                          onClick={(e) => e.stopPropagation()}
                          className="w-10 h-10 rounded-full bg-brand-900 text-white flex items-center justify-center"
                        >
                          <Icon name="phone" className="w-4 h-4" />
                        </a>
                      )}
                      {br.lat != null && (
                        <a
                          href={directions(br.lat, br.lng)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label="Branch directions"
                          onClick={(e) => e.stopPropagation()}
                          className="w-10 h-10 rounded-full bg-brand-400/40 text-brand-900 flex items-center justify-center"
                        >
                          <Icon name="navigation" className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {points.length > 0 && (
          <div className="mt-8">
            <h2 className={heading}>Location</h2>
            <LocationsMap points={points} />
          </div>
        )}

        <RatingSection business={business} onChanged={reload} />
      </div>

      {toast && (
        <div className="fixed top-6 inset-x-0 z-50 flex justify-center pointer-events-none">
          <div className="flex items-center gap-2 bg-brand-950 text-white text-sm font-medium px-4 py-2.5 rounded-full shadow-soft animate-fade-up">
            <Icon name="check" className="w-4 h-4" /> {toast}
          </div>
        </div>
      )}
    </div>
  )
}