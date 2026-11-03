import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { photoUrl } from '../lib/photos'
import { useAuth } from '../context/AuthContext'
import Page from '../components/Page'
import PageHeader from '../components/PageHeader'
import Field from '../components/Field'
import LocationPicker from '../components/LocationPicker'
import Button from '../components/Button'
import Icon from '../components/Icons'

const EMPTY = {
  label: '', description: '', city: '', subcity: '', address_text: '',
  phone: '', email: '', telegram: '', tiktok: '', website: '',
}
const toPoint = (p) => `SRID=4326;POINT(${p.lng} ${p.lat})`

const pill =
  'flex-1 flex items-center justify-center gap-1.5 bg-brand-400/30 text-brand-900 text-xs font-semibold py-2.5 rounded-full hover:bg-brand-400/60 transition'

// the form, used for both "Add branch" and "Edit branch"
function BranchSheet({ branch, onClose, onSave }) {
  const [form, setForm] = useState(
    branch ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, branch[k] || ''])) : EMPTY
  )
  const [pin, setPin] = useState(branch && branch.lat != null ? { lat: branch.lat, lng: branch.lng } : null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  async function submit(e) {
    e.preventDefault()
    setError('')
    if (!pin) return setError('Tap the map to place a pin for this branch')
    setBusy(true)
    const message = await onSave({ ...form, location: toPoint(pin) })
    setBusy(false)
    if (message) setError(message)
  }

  return (
    <div className="fixed inset-0 z-50 bg-brand-950/50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-bg w-full max-w-md max-h-[92vh] overflow-y-auto rounded-t-[2rem] p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-brand-400 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-brand-950">{branch ? 'Edit branch' : 'Add a branch'}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          <Field label="Area name (optional, e.g. Piassa)" {...bind('label')} />
          <Field label="Description" as="textarea" {...bind('description')} />
          <Field label="City" required {...bind('city')} />
          <Field label="Subcity" {...bind('subcity')} />
          <Field label="Address" {...bind('address_text')} />
          <Field label="Phone" type="tel" {...bind('phone')} />
          <Field label="Email" type="email" {...bind('email')} />
          <Field label="Telegram" placeholder="@yourname" {...bind('telegram')} />
          <Field label="TikTok" placeholder="@yourname" {...bind('tiktok')} />
          <Field label="Website" {...bind('website')} />

          <LocationPicker value={pin} onChange={setPin} />

          {!branch && (
            <p className="text-sm text-text-muted">
              After you save, use <b>Photos &amp; video</b> on the branch card to add its photos and cover video.
            </p>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving...' : branch ? 'Save changes' : 'Add branch'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default function ManageBranches() {
  const { id } = useParams()
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [branches, setBranches] = useState([])
  const [covers, setCovers] = useState({})
  const [sheet, setSheet] = useState(null) // null = closed, 'new' = add, or a branch = edit
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const [{ data: b }, { data: br }, { data: ph }] = await Promise.all([
      supabase.from('businesses').select('id, name, owner_id').eq('id', id).single(),
      supabase.from('branches').select('*').eq('business_id', id).order('created_at'),
      supabase
        .from('business_photos')
        .select('branch_id, storage_path, sort_order')
        .eq('business_id', id)
        .not('branch_id', 'is', null)
        .order('sort_order'),
    ])
    setBusiness(b)
    setBranches(br || [])

    const map = {}
    for (const p of ph || []) {
      if (!map[p.branch_id]) map[p.branch_id] = p.storage_path
    }
    setCovers(map)
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  // returns an error message, or null when it worked
  async function saveBranch(values) {
    const editing = sheet && sheet !== 'new'
    const { error } = editing
      ? await supabase.from('branches').update(values).eq('id', sheet.id)
      : await supabase.from('branches').insert({ business_id: id, ...values })
    if (error) return error.message
    setSheet(null)
    load()
    return null
  }

  async function removeBranch(br) {
    if (!window.confirm(`Delete ${business.name} Branch ${br.branch_number}? Its photos and video will be deleted too.`)) return

    const { data: photos } = await supabase.from('business_photos').select('storage_path').eq('branch_id', br.id)
    const { error } = await supabase.from('branches').delete().eq('id', br.id)
    if (error) return setError(error.message)

    const paths = (photos || []).map((p) => p.storage_path)
    if (paths.length) await supabase.storage.from('business-photos').remove(paths)
    if (br.video_path) await supabase.storage.from('business-videos').remove([br.video_path])
    load()
  }

  if (!user) return <Page><p className="text-text-muted">Please log in.</p></Page>
  if (!business) return <Page><p className="text-text-muted">Loading...</p></Page>
  if (business.owner_id !== user.id) return <Page><p className="text-text-muted">This isn't your business.</p></Page>

  return (
    <Page wide>
      <PageHeader
        back="/account/my-businesses"
        backLabel="My businesses"
        title="Branches"
        subtitle={`${business.name} · ${branches.length} branch${branches.length === 1 ? '' : 'es'}`}
      >
        <button
          onClick={() => setSheet('new')}
          className="shrink-0 flex items-center gap-1.5 bg-white text-brand-950 text-sm font-semibold px-4 py-2.5 rounded-full shadow-card"
        >
          <Icon name="plus" className="w-4 h-4" /> Add branch
        </button>
      </PageHeader>

      {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

      <div className="mt-5">
        {branches.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
              <Icon name="layers" className="w-6 h-6" />
            </div>
            <p className="text-brand-950 font-semibold">No branches yet</p>
            <p className="text-text-muted text-sm mt-1 mb-4">
              Each branch gets its own page, photos and video. Adding a branch is free.
            </p>
            <Button onClick={() => setSheet('new')}>
              <Icon name="plus" className="w-5 h-5" /> Add branch
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {branches.map((br) => {
              const addr = [br.address_text, br.subcity, br.city].filter(Boolean).join(', ')
              const cover = covers[br.id]
              return (
                <div key={br.id} className="bg-surface rounded-3xl p-4 shadow-card border border-brand-400/40">
                  <div className="flex gap-3">
                    {cover ? (
                      <img src={photoUrl(cover)} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                    ) : (
                      <span className="w-20 h-20 rounded-2xl bg-linear-to-br from-brand-900 to-brand-950 text-white flex items-center justify-center shrink-0">
                        <Icon name="layers" className="w-7 h-7" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-950 truncate">{business.name} Branch {br.branch_number}</h3>
{br.label && <p className="text-xs font-medium text-brand-700">{br.label}</p>}
                      <p className="flex items-start gap-1.5 text-sm text-text-muted mt-1.5">
                        <Icon name="pin" className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{addr || 'No address'}</span>
                      </p>
                      {br.phone && (
                        <p className="flex items-center gap-1.5 text-sm font-medium text-brand-900 mt-1">
                          <Icon name="phone" className="w-4 h-4 shrink-0" /> {br.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        br.lat != null ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {br.lat != null ? 'Map pin set' : 'No map pin'}
                    </span>
                    {br.video_path && (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-brand-400/30 text-brand-900">
                        Has video
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => setSheet(br)} className={pill}>
                      <Icon name="edit" className="w-4 h-4" /> Edit
                    </button>
                    <Link to={`/account/my-businesses/${id}/branches/${br.id}/photos`} className={pill}>
                      <Icon name="image" className="w-4 h-4" /> Photos
                    </Link>
                    <Link to={`/branch/${br.id}`} className={pill}>
                      <Icon name="globe" className="w-4 h-4" /> View
                    </Link>
                  </div>

                  <button
                    onClick={() => removeBranch(br)}
                    className="flex items-center gap-1.5 text-red-600 text-xs font-semibold mt-3"
                  >
                    <Icon name="trash" className="w-4 h-4" /> Delete branch
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {sheet && (
        <BranchSheet
          branch={sheet === 'new' ? null : sheet}
          onClose={() => setSheet(null)}
          onSave={saveBranch}
        />
      )}
    </Page>
  )
}