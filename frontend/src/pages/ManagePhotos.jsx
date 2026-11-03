import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { photoUrl, uploadBusinessPhotos } from '../lib/photos'
import FormPage, { Section } from '../components/FormPage'
import PhotoPicker from '../components/PhotoPicker'
import VideoManager from '../components/VideoManager'
import Button from '../components/Button'

export default function ManagePhotos() {
  const { id, branchId } = useParams()
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [branch, setBranch] = useState(null)
  const [photos, setPhotos] = useState([])
  const [files, setFiles] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const photoQuery = supabase
      .from('business_photos')
      .select('*')
      .eq('business_id', id)
      .order('sort_order')

    const [{ data: b }, { data: br }, { data: p }] = await Promise.all([
      supabase.from('businesses').select('id, name, owner_id, video_path').eq('id', id).single(),
      branchId
        ? supabase
            .from('branches')
            .select('id, label, branch_number, video_path')
            .eq('id', branchId)
            .eq('business_id', id)
            .single()
        : Promise.resolve({ data: null }),
      branchId ? photoQuery.eq('branch_id', branchId) : photoQuery.is('branch_id', null),
    ])
    setBusiness(b)
    setBranch(br)
    setPhotos(p || [])
  }, [id, branchId])

  useEffect(() => {
    load()
  }, [load])

  async function upload() {
    setBusy(true)
    setError('')
    try {
      const next = photos.length ? Math.max(...photos.map((p) => p.sort_order)) + 1 : 0
      await uploadBusinessPhotos(id, files, next, branchId || null)
      setFiles([])
      await load()
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  async function remove(photo) {
    await supabase.storage.from('business-photos').remove([photo.storage_path])
    await supabase.from('business_photos').delete().eq('id', photo.id)
    load()
  }

  async function makeCover(photo) {
    const min = Math.min(...photos.map((p) => p.sort_order))
    await supabase.from('business_photos').update({ sort_order: min - 1 }).eq('id', photo.id)
    load()
  }

  const backTo = branchId ? `/account/my-businesses/${id}/branches` : '/account/my-businesses'
  const backLabel = branchId ? 'Branches' : 'My businesses'
  const title = branchId ? 'Branch photos & video' : 'Photos & video'

  const wrap = (children, subtitle) => (
    <FormPage title={title} subtitle={subtitle} back={backTo} backLabel={backLabel}>
      {children}
    </FormPage>
  )

  if (!user) return wrap(<Section><p className="text-text-muted">Please log in.</p></Section>)
  if (!business) return wrap(<Section><p className="text-text-muted">Loading...</p></Section>)
  if (business.owner_id !== user.id) {
    return wrap(<Section><p className="text-text-muted">This isn't your business.</p></Section>)
  }
  if (branchId && !branch) {
    return wrap(<Section><p className="text-text-muted">Loading branch...</p></Section>)
  }

  const target = branchId ? branch : business
  const subtitle = branchId ? `${business.name} Branch ${branch.branch_number}` : business.name

  return wrap(
    <>
      <VideoManager
        businessId={id}
        branchId={branchId || null}
        videoPath={target.video_path}
        onChanged={load}
      />

      <Section
        title="Photos"
        hint={
          branchId
            ? 'These photos belong to this branch only. The first one is its cover.'
            : 'The first photo is the cover. Up to 10 photos.'
        }
      >
        {photos.length === 0 ? (
          <p className="text-text-muted text-sm">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((p, i) => (
              <div key={p.id}>
                <div className="relative">
                  <img src={photoUrl(p.storage_path)} alt="" className="w-full h-32 object-cover rounded-2xl" />
                  {i === 0 && (
                    <span className="absolute top-2 left-2 bg-brand-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                      Cover
                    </span>
                  )}
                </div>
                <div className="flex justify-between mt-1.5 text-xs font-semibold">
                  {i !== 0 ? (
                    <button onClick={() => makeCover(p)} className="text-brand-700">Make cover</button>
                  ) : (
                    <span />
                  )}
                  <button onClick={() => remove(p)} className="text-red-600">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {photos.length < 10 && (
        <Section title="Add photos">
          <PhotoPicker files={files} setFiles={setFiles} max={10 - photos.length} />
          {files.length > 0 && (
            <Button onClick={upload} disabled={busy} className="w-full">
              {busy ? 'Uploading...' : `Upload ${files.length} photo${files.length > 1 ? 's' : ''}`}
            </Button>
          )}
          {error && <p className="text-red-600 text-sm">{error}</p>}
        </Section>
      )}
    </>,
    subtitle
  )
}