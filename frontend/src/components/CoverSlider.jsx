import { useEffect, useRef, useState } from 'react'
import { photoUrl } from '../lib/photos'
import { videoUrl } from '../lib/video'
import Icon from './Icons'

export default function CoverSlider({ business, photos, children }) {
  const scroller = useRef(null)
  const videoRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [muted, setMuted] = useState(true)

  // the video comes first (if there is one), then the photos
  const slides = [
    ...(business.video_path ? [{ id: 'video', type: 'video' }] : []),
    ...photos.map((p) => ({ id: p.id, type: 'photo', path: p.storage_path })),
  ]
  const count = slides.length
  const firstPhoto = photos[0]?.storage_path
  const onVideo = slides[index]?.type === 'video'

  function onScroll(e) {
    const el = e.currentTarget
    setIndex(Math.round(el.scrollLeft / el.clientWidth))
  }

  function goTo(i) {
    const el = scroller.current
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  // the video only plays while it is on screen
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (onVideo) v.play().catch(() => {})
    else v.pause()
  }, [onVideo])

  const circle =
    'w-10 h-10 rounded-full bg-white/90 backdrop-blur text-brand-950 flex items-center justify-center shadow-card'

  return (
    <div className="relative h-80 md:h-[26rem] bg-brand-950">
      {count > 0 ? (
        <div
          ref={scroller}
          onScroll={onScroll}
          className="flex h-full overflow-x-auto overscroll-x-contain snap-x snap-mandatory no-scrollbar"
        >
          {slides.map((s) => (
            <div key={s.id} className="w-full h-full shrink-0 snap-center">
              {s.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={videoUrl(business.video_path)}
                  poster={firstPhoto ? photoUrl(firstPhoto) : undefined}
                  autoPlay
                  muted={muted}
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={photoUrl(s.path)} alt="" draggable={false} className="w-full h-full object-cover" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full h-full bg-linear-to-br from-brand-700 to-brand-900 text-white flex items-center justify-center">
          <Icon name="store" className="w-14 h-14" />
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-b from-brand-950/50 via-transparent to-transparent pointer-events-none" />

      {/* arrows for PC (on a phone you just swipe) */}
      {count > 1 && index > 0 && (
        <button
          onClick={() => goTo(index - 1)}
          aria-label="Previous"
          className={`${circle} hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10`}
        >
          <Icon name="chevron" className="w-5 h-5 rotate-180" />
        </button>
      )}
      {count > 1 && index < count - 1 && (
        <button
          onClick={() => goTo(index + 1)}
          aria-label="Next"
          className={`${circle} hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10`}
        >
          <Icon name="chevron" className="w-5 h-5" />
        </button>
      )}

      {count > 1 && (
        <div className="absolute bottom-12 inset-x-0 flex justify-center gap-1.5 z-10">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/60'
              }`}
            />
          ))}
        </div>
      )}

      {onVideo && (
        <button
          onClick={() => setMuted(!muted)}
          aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
          className={`${circle} absolute bottom-12 right-4 z-10`}
        >
          <Icon name={muted ? 'volumeOff' : 'volume'} className="w-5 h-5" />
        </button>
      )}

      {/* back / share / save buttons come from the page */}
      <div className="absolute inset-x-0 top-0 p-4 flex justify-between z-10">{children}</div>
    </div>
  )
}