import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { photoUrl } from '../lib/photos'
import { useAllCategories } from '../hooks/useAllCategories'
import Icon from '../components/Icons'

const PAGE_SIZE = 20

const STATUSES = [
  ['all', 'All'],
  ['active', 'Live'],
  ['pending', 'Pending'],
  ['hidden', 'Hidden'],
  ['rejected', 'Rejected'],
]

const BADGE = {
  active: ['Live', 'bg-emerald-100 text-emerald-800'],
  pending: ['Pending', 'bg-amber-100 text-amber-800'],
  hidden: ['Hidden', 'bg-slate-200 text-slate-700'],
  rejected: ['Rejected', 'bg-red-100 text-red-700'],
}

const clean = (text) => text.trim().replace(/[,()%]/g, ' ')

const fieldClass =
  'bg-surface border border-brand-400/50 rounded-2xl px-4 py-3 outline-none focus:border-brand-700 w-full shadow-card'

export default function AdminBusinesses() {
  const [params] = useSearchParams()
  const categories = useAllCategories()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(params.get('status') || 'all')
  const [categoryId, setCategoryId] = useState('')
  const [city, setCity] = useState('')

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // parents first, each followed by its children
  const ordered = useMemo(() => {
    const parents = categories.filter((c) => !c.parent_category_id)
    return parents.flatMap((p) => [p, ...categories.filter((c) => c.parent_category_id === p.id)])
  }, [categories])

  // picking "Food & Drink" also includes Cafe, Restaurant, etc.
  const categoryIds = useMemo(() => {
    if (!categoryId) return null
    const kids = categories.filter((c) => c.parent_category_id === categoryId).map((c) => c.id)
    return [categoryId, ...kids]
  }, [categoryId, categories])
  const categoryKey = categoryIds ? categoryIds.join(',') : ''

  const fetchPage = useCallback(
    (from) => {
      let q = supabase
        .from('businesses')
        .select(
          '*, categories(name), profiles(username), business_photos(storage_path, sort_order, branch_id), branches(id)',
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })
        .range(from, from + PAGE_SIZE - 1)

      if (status !== 'all') q = q.eq('status', status)
      if (categoryIds) q = q.in('category_id', categoryIds)
      if (clean(city)) q = q.ilike('city', `%${clean(city)}%`)
      const s = clean(search)
      if (s) q = q.or(`name.ilike.%${s}%,phone.ilike.%${s}%,email.ilike.%${s}%,subcity.ilike.%${s}%`)
      return q
    },
    [status, categoryKey, city, search] // eslint-disable-line
  )

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const timer = setTimeout(async () => {
      const { data, error, count } = await fetchPage(0)
      if (cancelled) return
      if (error) setError(error.message)
      else {
        setError('')
        setRows(data)
        setTotal(count || 0)
      }
      setLoading(false)
    }, 300)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [fetchPage])

  async function loadMore() {
    const { data, error } = await fetchPage(rows.length)
    if (error) return setError(error.message)
    setRows((r) => [...r, ...data])
  }

  async function toggleHidden(b) {
    const next = b.status === 'hidden' ? 'active' : 'hidden'
    const { error } = await supabase.from('businesses').update({ status: next }).eq('id', b.id)
    if (error) return setError(error.message)
    if (status === 'all') {
      setRows((r) => r.map((x) => (x.id === b.id ? { ...x, status: next } : x)))
    } else {
      // it no longer matches the current filter
      setRows((r) => r.filter((x) => x.id !== b.id))
      setTotal((t) => Math.max(0, t - 1))
    }
  }

  async function confirmDelete() {
    const b = toDelete
    setDeleting(true)
    setError('')

    // remember the file paths first, because the rows disappear with the business
      const [{ data: photos }, { data: pays }, { data: branchRows }] = await Promise.all([
      supabase.from('business_photos').select('storage_path').eq('business_id', b.id),
      supabase.from('payments').select('receipt_storage_path').eq('business_id', b.id),
      supabase.from('branches').select('video_path').eq('business_id', b.id),
    ])

    const { data: removed, error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', b.id)
      .select('id')

    if (error || !removed?.length) {
      setDeleting(false)
      return setError(error?.message || 'Could not delete. Check that the admin_controls migration was pushed.')
    }

    const photoPaths = (photos || []).map((p) => p.storage_path)
    const receiptPaths = (pays || []).map((p) => p.receipt_storage_path).filter(Boolean)
    if (photoPaths.length) await supabase.storage.from('business-photos').remove(photoPaths)
    if (receiptPaths.length) await supabase.storage.from('payment-receipts').remove(receiptPaths)
        if (b.video_path) await supabase.storage.from('business-videos').remove([b.video_path])
              const branchVideoPaths = (branchRows || []).map((r) => r.video_path).filter(Boolean)
        if (branchVideoPaths.length) await supabase.storage.from('business-videos').remove(branchVideoPaths)
    setRows((r) => r.filter((x) => x.id !== b.id))
    setTotal((t) => Math.max(0, t - 1))
    setToDelete(null)
    setDeleting(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-950">Businesses</h1>
      <p className="text-text-muted text-sm mb-6">Search, hide or remove any business on the app</p>

      <div className="flex flex-col gap-3 mb-5">
        <div className="flex items-center gap-3 bg-surface border border-brand-400/50 rounded-2xl px-4 py-3 shadow-card focus-within:border-brand-700">
          <Icon name="search" className="w-5 h-5 text-brand-700 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, email or subcity..."
            className="flex-1 min-w-0 outline-none bg-transparent"
          />
          {search && (
            <button onClick={() => setSearch('')} aria-label="Clear search" className="text-text-muted">
              <Icon name="x" className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {STATUSES.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setStatus(key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition ${
                status === key
                  ? 'bg-brand-900 text-white'
                  : 'bg-surface border border-brand-400/50 text-brand-900 hover:bg-brand-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={fieldClass}>
            <option value="">All categories</option>
            {ordered.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parent_category_id ? '— ' : ''}
                {c.name}
              </option>
            ))}
          </select>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Filter by city"
            className={fieldClass}
          />
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      <p className="text-sm text-text-muted mb-3">
        {total} business{total === 1 ? '' : 'es'}
      </p>

      {loading ? (
        <p className="text-text-muted text-sm">Loading...</p>
      ) : rows.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
            <Icon name="search" className="w-6 h-6" />
          </div>
          <p className="text-text-muted">No businesses match.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((b) => {
            const cover = [...(b.business_photos || [])].filter((p) => !p.branch_id).sort((x, y) => x.sort_order - y.sort_order)[0]
            const [badgeText, badgeCls] = BADGE[b.status] || BADGE.pending
            const place = [b.subcity, b.city].filter(Boolean).join(', ')

            return (
              <div
                key={b.id}
                className="bg-surface rounded-3xl p-4 shadow-card border border-brand-400/40 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex gap-3 flex-1 min-w-0">
                  {cover ? (
                    <img src={photoUrl(cover.storage_path)} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-brand-400 to-brand-700 text-white flex items-center justify-center shrink-0">
                      <Icon name="store" className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-brand-950 truncate">{b.name}</h3>
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${badgeCls}`}>
                        {badgeText}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted truncate">
                      {b.categories?.name}
                      {place && ` · ${place}`}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      Owner: {b.profiles?.username || '—'} · {b.branches?.length || 0} branches · added{' '}
                      {new Date(b.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 flex-wrap">
                  <Link
                    to={`/business/${b.id}`}
                    className="flex items-center gap-1.5 bg-brand-400/30 text-brand-900 text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-brand-400/60 transition"
                  >
                    <Icon name="globe" className="w-4 h-4" /> View
                  </Link>
                  {(b.status === 'active' || b.status === 'hidden') && (
                    <button
                      onClick={() => toggleHidden(b)}
                      className="flex items-center gap-1.5 border border-brand-400 text-brand-900 text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-brand-100 transition"
                    >
                      {b.status === 'hidden' ? 'Unhide' : 'Hide'}
                    </button>
                  )}
                  <button
                    onClick={() => setToDelete(b)}
                    className="flex items-center gap-1.5 text-red-600 text-xs font-semibold px-3 py-2.5 rounded-full hover:bg-red-50 transition"
                  >
                    <Icon name="trash" className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            )
          })}

          {rows.length < total && (
            <button
              onClick={loadMore}
              className="mt-2 mx-auto px-6 py-3 rounded-full border border-brand-400 text-brand-900 font-semibold text-sm hover:bg-brand-100 transition"
            >
              Load more ({total - rows.length} left)
            </button>
          )}
        </div>
      )}

      {toDelete && (
        <div
          className="fixed inset-0 z-50 bg-brand-950/50 flex items-center justify-center p-4"
          onClick={() => !deleting && setToDelete(null)}
        >
          <div className="bg-surface rounded-3xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Icon name="trash" />
            </div>
            <h2 className="text-lg font-bold text-brand-950">Delete "{toDelete.name}"?</h2>
            <p className="text-sm text-text-muted mt-2">
              This permanently removes the business with its branches, photos, ratings and payment records.
              It can't be undone. To just take it off the app for now, use Hide instead.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setToDelete(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-full border border-brand-400 text-brand-900 font-semibold text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-full bg-red-600 text-white font-semibold text-sm disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}