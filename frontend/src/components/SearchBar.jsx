import Icon from './Icons'

export default function SearchBar({ value, onChange, onFilterClick, onFocus, onBlur, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
      className="flex items-center gap-3 bg-surface rounded-2xl pl-4 pr-2 py-2 shadow-soft border border-brand-400/50 focus-within:border-brand-700 transition"
    >
      <Icon name="search" className="w-5 h-5 text-brand-700 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder="Search cafes, hotels, pharmacies..."
        className="flex-1 min-w-0 outline-none bg-transparent text-text placeholder:text-text-muted"
      />
      <button
        type="button"
        onClick={onFilterClick}
        className="w-11 h-11 rounded-xl bg-brand-900 text-white flex items-center justify-center shrink-0"
      >
        <Icon name="sliders" />
      </button>
    </form>
  )
}