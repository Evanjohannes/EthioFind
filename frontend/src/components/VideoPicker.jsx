import { useEffect, useState } from 'react'
import Icon from './Icons'

export const MAX_VIDEO_SECONDS = 20
export const MAX_VIDEO_MB = 15
const TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

// reads the length of a video file inside the browser
function readDuration(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    v.preload = 'metadata'
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url)
      resolve(v.duration)
    }
    v.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("This video can't be read. Try an MP4 file."))
    }
    v.src = url
  })
}

export default function VideoPicker({ file, setFile, replace = false }) {
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  async function onPick(e) {
    const picked = e.target.files[0]
    e.target.value = ''
    if (!picked) return
    setError('')

    if (!TYPES.includes(picked.type)) {
      return setError('Please choose an MP4 video.')
    }
    if (picked.size > MAX_VIDEO_MB * 1024 * 1024) {
      return setError(
        `That video is too big (max ${MAX_VIDEO_MB} MB). Tip: send it to yourself on WhatsApp or Telegram first, which shrinks it, then pick that copy.`
      )
    }
    try {
      const seconds = await readDuration(picked)
      if (Number.isFinite(seconds) && seconds > MAX_VIDEO_SECONDS + 0.5) {
        return setError(`That video is ${Math.round(seconds)} seconds long. Please keep it under ${MAX_VIDEO_SECONDS} seconds.`)
      }
      setFile(picked)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div>
      {file ? (
        <div>
          <video src={preview} controls muted playsInline className="w-full max-h-56 rounded-2xl bg-brand-950" />
          <div className="flex items-center justify-between mt-2 text-sm">
            <span className="text-text-muted truncate">
              {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
            </span>
            <button type="button" onClick={() => setFile(null)} className="text-red-600 font-semibold shrink-0 ml-3">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-1 border-2 border-dashed border-brand-400 rounded-2xl py-5 px-3 text-center text-brand-900 cursor-pointer hover:bg-brand-100 transition">
          <Icon name="video" className="w-6 h-6 text-brand-700" />
          <span className="text-sm font-semibold">{replace ? 'Choose a different video' : 'Add a short video'}</span>
          <span className="text-xs text-text-muted">
            Up to {MAX_VIDEO_SECONDS} seconds and {MAX_VIDEO_MB} MB. MP4 works best.
          </span>
          <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={onPick} className="hidden" />
        </label>
      )}
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  )
}