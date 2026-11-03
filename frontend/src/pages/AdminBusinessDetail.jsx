import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { photoUrl } from '../lib/photos'
import { videoUrl } from '../lib/video'
import { deleteBusinessAsAdmin, deleteBranchAsAdmin } from '../lib/adminDelete'
import DeleteWithReason from '../components/DeleteWithReason'
import Icon from '../components/Icons'

const BADGE = {
  active: ['Live', 'bg-emerald-100 text-emerald-800'],
  pending: ['Pending', 'bg-amber-100 text-amber-800'],
  hidden: ['Hidden', 'bg-slate-200 text-slate-700'],
  rejected: ['Rejected', 'bg-red-100 text-red-700'],
}

const PAY_BADGE = {
  approved: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  rejected: 'bg-red-100 text-red-700',
}

const card = 'bg-surface rounded-3xl p-5 shadow-card border border-brand-400/40'
const smallBtn =
  'flex items-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-full transition'

const joinAddress = (o) => [o.address_text, o.subcity, o.city].filter(Boolean).join(', ')
const pinText = (o) => (o.lat != null ? `${o.lat.toFixed(5)}, ${o.lng.toFixed(5)}` : 'Not set')
const date = (d) => new Date(d).toLocaleDateString()

function InfoRows({ rows }) {
  const filled = rows.filter(([, value]) => value)
  if (filled.length === 0) return <p className="text-sm text-text-muted">No details added.</p>
  return (
    <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
      {filled.map(([label, value, wide]) => (
        <div key={label} className={`min-w-0 ${wide ? 'sm:col-span-2' : ''}`}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</dt>
          <dd className="text-sm text-brand-950 mt-0.5 break-words">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Media({ videoPath, photos }) {
  if (!videoPath && photos.length === 0) {
    return <p className="text-sm text-text-muted mb-4">No photos or video.</p>
  }
  return (
    <div className="flex flex-col gap-3 mb-4">
      {videoPath && (
        <video
          src={videoUrl(videoPath)}
          controls
          muted
          playsInline
          preload="metadata"
          className="w-full max-h-64 rounded-2xl bg-brand-950"
        />
      )}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {photos.map((p) => (
            <a key={p.id} href={photoUrl(p.storage_path)} target="_blank" rel="noreferrer">
              <img src={photoUrl(p.storage_path)} alt="" loading="lazy" className="w-full h-20 object-cover rounded-xl" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminBusinessDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [branches, setBranches] = useState([])
  const [photos, setPhotos] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [target, setTarget] = useState(null) // null, or { type: 'business' } / { type: 'branch', branch }
  const [busy, setBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const load = useCallback(async () => {
    const [{ data: b }, { data: br }, { data: ph }, { data: pay }] = await Promise.all([
      supabase.from('businesses').select('*, categories(name), profiles(username, phone)').eq('id', id).single(),
      supabase.from('branches').select('*').eq('business_id', id).order('branch_number'),
      supabase.from('business_photos').select('*').eq('business_id', id).order('sort_order'),
      supabase
        .from('payments')
        .select('*, payment_methods(method_type)')
        .eq('business_id', id)
        .order('created_at', { ascending: false }),
    ])
    setBusiness(b)
    setBranches(br || [])
    setPhotos(ph || [])
    setPayments(pay || [])
    setLoading(false)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  async function toggleHidden() {
    const next = business.status === 'hidden' ? 'active' : 'hidden'
    const { error } = await supabase.from('businesses').update({ status: next }).eq('id', business.id)
    if (error) return setError(error.message)
    load()
  }

  async function confirmDelete(reason) {
    setBusy(true)
    setDeleteError('')
    try {
      if (target.type === 'branch') {
        await deleteBranchAsAdmin(target.branch.id, reason)
        setTarget(null)
        await load()
      } else {
        await deleteBusinessAsAdmin(business.id, reason)
        navigate('/admin/businesses')
      }
    } catch (err) {
      setDeleteError(err.message)
    }
    setBusy(false)
  }

  if (loading) return <p className="text-text-muted">Loading...</p>
  if (!business) return <p className="text-text-muted">Business not found.</p>

  const b = business
  const [badgeText, badgeCls] = BADGE[b.status] || BADGE.pending

  const mainRows = [
    ['Category', b.categories?.name],
    ['Owner', b.profiles?.username],
    ['Owner phone', b.profiles?.phone],
    ['Address', joinAddress(b)],
    ['Phone', b.phone],
    ['Email', b.email],
    ['Telegram', b.telegram],
    ['TikTok', b.tiktok],
    ['Website', b.website],
    ['Rating', b.rating_count > 0 ? `${b.rating_avg} (${b.rating_count} ratings)` : 'No ratings yet'],
    ['Map pin', pinText(b)],
    ['Description', b.description, true],
  ]

  return (
    <div>
      <Link to="/admin/businesses" className="inline-flex items-center gap-1 text-sm text-brand-700 font-medium">
        <Icon name="back" className="w-4 h-4" /> Businesses
      </Link>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-3 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-brand-950">{b.name}</h1>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badgeCls}`}>{badgeText}</span>
          </div>
          <p className="text-text-muted text-sm">Added {date(b.created_at)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to={`/business/${b.id}`} className={`${smallBtn} bg-brand-400/30 text-brand-900 hover:bg-brand-400/60`}>
            <Icon name="globe" className="w-4 h-4" /> Public page
          </Link>
          {(b.status === 'active' || b.status === 'hidden') && (
            <button onClick={toggleHidden} className={`${smallBtn} border border-brand-400 text-brand-900 hover:bg-brand-100`}>
              {b.status === 'hidden' ? 'Unhide' : 'Hide'}
            </button>
          )}
          <button
            onClick={() => {
              setDeleteError('')
              setTarget({ type: 'business' })
            }}
            className={`${smallBtn} text-red-600 hover:bg-red-50`}
          >
            <Icon name="trash" className="w-4 h-4" /> Delete business
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <section className={card}>
        <h2 className="text-lg font-bold text-brand-950 mb-4">Main business</h2>
        <Media videoPath={b.video_path} photos={photos.filter((p) => !p.branch_id)} />
        <InfoRows rows={mainRows} />
      </section>

      <section className={`${card} mt-5`}>
        <h2 className="text-lg font-bold text-brand-950 mb-4">Payments</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-text-muted">No payments.</p>
        ) : (
          <div className="flex flex-col divide-y divide-brand-400/30">
            {payments.map((p) => (
              <div key={p.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-brand-950">
                    {p.amount} ETB · {p.payment_methods?.method_type || '—'}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${PAY_BADGE[p.status]}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-0.5">{date(p.created_at)}</p>
                {p.admin_notes && <p className="text-sm text-text mt-1">Note: {p.admin_notes}</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      <h2 className="text-lg font-bold text-brand-950 mt-8 mb-3">Branches ({branches.length})</h2>
      {branches.length === 0 ? (
        <p className="text-sm text-text-muted">This business has no branches.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {branches.map((br) => {
            const rows = [
              ['Area name', br.label],
              ['Address', joinAddress(br)],
              ['Phone', br.phone],
              ['Email', br.email],
              ['Telegram', br.telegram],
              ['TikTok', br.tiktok],
              ['Website', br.website],
              ['Map pin', pinText(br)],
              ['Added', date(br.created_at)],
              ['Description', br.description, true],
            ]
            return (
              <section key={br.id} className={card}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-brand-950 truncate">
                      {b.name} Branch {br.branch_number}
                    </h3>
                    <p className="text-xs text-brand-700 font-medium">Its own details, photos and video</p>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                    <Link to={`/branch/${br.id}`} className={`${smallBtn} bg-brand-400/30 text-brand-900 hover:bg-brand-400/60`}>
                      <Icon name="globe" className="w-4 h-4" /> View
                    </Link>
                    <button
                      onClick={() => {
                        setDeleteError('')
                        setTarget({ type: 'branch', branch: br })
                      }}
                      className={`${smallBtn} text-red-600 hover:bg-red-50`}
                    >
                      <Icon name="trash" className="w-4 h-4" /> Delete branch
                    </button>
                  </div>
                </div>
                <Media videoPath={br.video_path} photos={photos.filter((p) => p.branch_id === br.id)} />
                <InfoRows rows={rows} />
              </section>
            )
          })}
        </div>
      )}

      {target && (
        <DeleteWithReason
          title={
            target.type === 'branch'
              ? `Delete ${b.name} Branch ${target.branch.branch_number}?`
              : `Delete "${b.name}"?`
          }
          warning={
            target.type === 'branch'
              ? 'This permanently removes this branch with its own photos and video. The main business stays.'
              : 'This permanently removes the business with all its branches, photos, ratings and payment records. To just take it off the app for now, use Hide instead.'
          }
          busy={busy}
          error={deleteError}
          onClose={() => setTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  )
}