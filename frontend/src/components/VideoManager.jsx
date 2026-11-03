import { useState } from 'react'
import { Section } from './FormPage'
import VideoPicker from './VideoPicker'
import Button from './Button'
import { videoUrl, uploadBusinessVideo, removeBusinessVideo } from '../lib/video'

export default function VideoManager({ businessId, branchId = null, videoPath, onChanged }) {
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    setBusy(true)
    setError('')
    try {
      await uploadBusinessVideo(businessId, file, videoPath, branchId)
      setFile(null)
      onChanged()
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  async function remove() {
    if (!window.confirm('Remove the cover video?')) return
    setBusy(true)
    setError('')
    try {
      await removeBusinessVideo(businessId, videoPath, branchId)
      onChanged()
    } catch (err) {
      setError(err.message)
    }
    setBusy(false)
  }

  return (
    <Section title="Cover video" hint="Optional. A short clip that plays at the top of the page.">
      {videoPath && !file && (
        <div>
          <video
            src={videoUrl(videoPath)}
            controls
            muted
            playsInline
            preload="metadata"
            className="w-full max-h-56 rounded-2xl bg-brand-950"
          />
          <button onClick={remove} disabled={busy} className="text-red-600 text-sm font-semibold mt-2">
            Remove video
          </button>
        </div>
      )}

      <VideoPicker file={file} setFile={setFile} replace={Boolean(videoPath)} />

      {file && (
        <Button onClick={save} disabled={busy} className="w-full">
          {busy ? 'Uploading...' : videoPath ? 'Replace video' : 'Upload video'}
        </Button>
      )}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </Section>
  )
}