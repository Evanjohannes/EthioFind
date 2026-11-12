import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useSaved } from '../hooks/useSaved'
import { href, shown, directions, isExternal } from '../lib/contact'
import CoverSlider from '../components/CoverSlider'
import LocationsMap from '../components/LocationsMap'
import Icon from '../components/Icons'

const CHIPS = [
  ['email', 'mail'],
  ['telegram', 'send'],
  ['tiktok', 'tiktok'],
  ['website', 'globe'],
]

const heading = 'text-sm font-semibold tracking-wide uppercase text-brand-700 mb-3'

const circleBtn =
  'w-10 h-10 rounded-full bg-white/90 backdrop-blur text-brand-950 flex items-center justify-center shadow-card'

const joinAddress = (o) => [o.address_text, o.subcity, o.city].filter(Boolean).join(', ')

export default function BranchProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { savedIds, toggleSave } = useSaved()
  const [branch, setBranch] = useState(null)
  const [photos, setPhotos] = useState([])
  const [others, setOthers] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

    useEffect(() => {
    if (!branch) return
    document.title = `${branch.businesses.name} Branch ${branch.branch_number} | EthioFind`
    return () => {
      document.title = 'EthioFind'
    }
  }, [branch])

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: br } = await supabase
        .from('branches')
        .select('*, businesses(id, name, address_text, subcity, city, rating_avg, rating_count, categories(name))')
        .eq('id', id)
        .single()

      if (!br) {
        setBranch(null)
        setLoading(false)
        return
      }

      const [{ data: ph }, { data: sib }] = await Promise.all([
        supabase.from('business_photos').select('*').eq('branch_id', id).order('sort_order'),
        supabase
          .from('branches')
          .select('id, label, branch_number, address_text, subcity, city')
          .eq('business_id', br.business_id)
          .neq('id', id)
          .order('branch_number'),
      ])

      setBranch(br)
      setPhotos(ph || [])
      setOthers(sib || [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <p className="p-5 text-text-muted">Loading...</p>
  if (!branch) return <p className="p-5 text-text-muted">Branch not found.</p>

  const parent = branch.businesses
  const branchName = `${parent.name} Branch ${branch.branch_number}`
  const hasPin = branch.lat != null
  const address = joinAddress(branch)

  const chips = CHIPS.filter(([k]) => branch[k]).map(([k, icon]) => ({
    key: k,
    icon,
    value: shown(k, branch[k]),
    url: href(k, branch[k]),
  }))

  const locations = [
    { key: 'main', to: `/business/${parent.id}`, title: `${parent.name} (main)`, address: joinAddress(parent) },
    ...others.map((o) => ({
      key: o.id,
      to: `/branch/${o.id}`,
      title: `Branch ${o.branch_number}${o.label ? ` · ${o.label}` : ''}`,
      address: joinAddress(o),
    })),
  ]

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(''), 2200)
  }

  async function handleShare() {
    const url = `${window.location.origin}/branch/${branch.id}`
    const text = address ? `${branchName} — ${address}` : branchName

    if (navigator.share) {
      try {
        await navigator.share({ title: branchName, text, url })
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
    const result = await toggleSave(parent.id)
    if (result.needsAuth) navigate('/signup')
  }

  return (
    <div className="max-w-md md:max-w-3xl mx-auto pb-28 md:pt-6">
      <CoverSlider business={branch} photos={photos}>
        <button onClick={() => navigate(-1)} className={circleBtn} aria-label="Back">
          <Icon name="back" />
        </button>
        <div className="flex gap-2">
          <button onClick={handleShare} className={circleBtn} aria-label="Share">
            <Icon name="share" />
          </button>
          <button onClick={handleSave} className={circleBtn} aria-label="Save">
            <Icon name="heart" filled={savedIds.has(parent.id)} />
          </button>
        </div>
      </CoverSlider>

      <div className="relative -mt-8 bg-bg rounded-t-[2rem] px-5 pt-6">
        <h1 className="text-[1.65rem] font-bold text-brand-950 leading-tight">{branchName}</h1>

        {address && (
          <p className="flex items-start gap-1.5 text-text-muted mt-1.5">
            <Icon name="pin" className="w-4 h-4 mt-0.5 shrink-0 text-brand-700" />
            <span>{address}</span>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
          <span className="inline-flex items-center gap-1 bg-brand-900 text-white font-semibold px-3 py-1 rounded-full text-xs">
            <Icon name="layers" className="w-3.5 h-3.5" /> Branch{branch.label ? ` · ${branch.label}` : ''}
          </span>
          {parent.categories?.name && (
            <span className="bg-brand-400/40 text-brand-900 font-semibold px-3 py-1 rounded-full text-xs">
              {parent.categories.name}
            </span>
          )}
          {parent.rating_count > 0 ? (
            <Link to={`/business/${parent.id}`} className="flex items-center gap-1 font-semibold text-brand-950">
              <Icon name="star" className="w-4 h-4 text-amber-500" filled />
              {parent.rating_avg}
              <span className="text-text-muted font-normal">({parent.rating_count})</span>
            </Link>
          ) : (
            <span className="text-text-muted">No ratings yet</span>
          )}
        </div>

        {(branch.phone || hasPin) && (
          <div className="flex gap-3 mt-5">
            {branch.phone && (
              <a
                href={href('phone', branch.phone)}
                className="flex-1 flex items-center justify-center gap-2.5 bg-linear-to-br from-brand-900 to-brand-950 text-white rounded-full py-3.5 shadow-soft font-semibold active:scale-[0.99] transition"
              >
                <Icon name="phone" className="w-5 h-5" />
                <span>Call</span>
                <span className="text-brand-400">·</span>
                <span className="font-medium">{branch.phone}</span>
              </a>
            )}
            {hasPin && (
              <a
                href={directions(branch.lat, branch.lng)}
                target="_blank"
                rel="noreferrer"
                aria-label="Directions"
                className={`flex items-center justify-center gap-2 rounded-full font-semibold transition ${
                  branch.phone
                    ? 'w-14 bg-brand-400/40 text-brand-900 hover:bg-brand-400/70'
                    : 'flex-1 py-3.5 bg-linear-to-br from-brand-900 to-brand-950 text-white shadow-soft'
                }`}
              >
                <Icon name="navigation" className="w-5 h-5" />
                {!branch.phone && <span>Directions</span>}
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

        {branch.description && (
          <div className="mt-7">
            <h2 className={heading}>About this branch</h2>
            <p className="text-text leading-relaxed">{branch.description}</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className={heading}>Other locations</h2>
          <div className="flex flex-col gap-3">
            {locations.map((l) => (
              <Link
                key={l.key}
                to={l.to}
                className="flex items-center gap-3 bg-surface rounded-3xl p-4 shadow-card border border-brand-400/40 hover:shadow-soft transition"
              >
                <span className="w-11 h-11 rounded-2xl bg-linear-to-br from-brand-900 to-brand-950 text-white flex items-center justify-center shrink-0">
                  <Icon name={l.key === 'main' ? 'store' : 'layers'} />
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-brand-950 truncate">{l.title}</h3>
                  {l.address && <p className="text-sm text-text-muted truncate">{l.address}</p>}
                </div>
                <Icon name="chevron" className="w-4 h-4 text-brand-700 shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {hasPin && (
          <div className="mt-8">
            <h2 className={heading}>Location</h2>
            <LocationsMap
              points={[
                {
                  id: branch.id,
                  label: branchName,
                  lat: branch.lat,
                  lng: branch.lng,
                  address: branch.address_text,
                },
              ]}
            />
          </div>
        )}

        <Link
          to={`/business/${parent.id}`}
          className="flex items-center justify-center gap-1 text-sm text-brand-700 font-semibold mt-8"
        >
          Read reviews and rate {parent.name} <Icon name="chevron" className="w-4 h-4" />
        </Link>
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