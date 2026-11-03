import { useMemo } from 'react'

export default function PhotoPicker({ files, setFiles, max = 10 }) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files])

  function add(e) {
    setFiles([...files, ...e.target.files].slice(0, max))
    e.target.value = ''
  }

  return (
    <div>
      <p className="text-sm text-text-muted mb-2">
        Business photos ({files.length}/{max}). The first one is your cover photo.
      </p>
      <div className="flex gap-2 flex-wrap">
        {previews.map((src, i) => (
          <div key={src} className="relative w-20 h-20">
            <img src={src} alt="" className="w-20 h-20 object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
              className="absolute -top-2 -right-2 bg-brand-900 text-white w-6 h-6 rounded-full text-xs"
            >
              ✕
            </button>
          </div>
        ))}
        {files.length < max && (
          <label className="w-20 h-20 rounded-xl border-2 border-dashed border-brand-400 flex items-center justify-center text-2xl text-brand-400 cursor-pointer">
            +
            <input type="file" accept="image/*" multiple onChange={add} className="hidden" />
          </label>
        )}
      </div>
    </div>
  )
}