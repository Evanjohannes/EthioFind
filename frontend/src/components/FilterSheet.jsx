import Button from './Button'

export default function FilterSheet({ open, onClose, city, setCity, topRated, setTopRated, onReset }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-brand-950/50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-md rounded-t-[2rem] p-6 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-brand-400 rounded-full mx-auto mb-5" />
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-brand-950">Filters</h2>
          <button onClick={onReset} className="text-sm text-brand-700 font-semibold">Reset</button>
        </div>

        <label className="text-sm font-medium text-text-muted">City</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Addis Ababa"
          className="bg-bg border border-brand-400/60 rounded-2xl px-4 py-3 outline-none focus:border-brand-700 w-full mt-1 mb-4"
        />

        <label className="flex items-center justify-between py-3 px-4 bg-bg rounded-2xl">
          <span className="text-text font-medium">Top rated first</span>
          <input
            type="checkbox"
            checked={topRated}
            onChange={(e) => setTopRated(e.target.checked)}
            className="w-5 h-5 accent-brand-900"
          />
        </label>

        <Button className="w-full mt-6" onClick={onClose}>Show results</Button>
      </div>
    </div>
  )
}