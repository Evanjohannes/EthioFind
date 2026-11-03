export default function CategoryChip({ label, icon, active = false, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 shrink-0 w-[76px] group">
      <span
        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl transition ${
          active
            ? 'bg-brand-900 shadow-soft'
            : 'bg-surface border border-brand-400/60 group-hover:bg-brand-100'
        }`}
      >
        {icon}
      </span>
      <span
        className={`text-[11px] leading-tight text-center font-medium ${
          active ? 'text-brand-900' : 'text-text-muted'
        }`}
      >
        {label}
      </span>
    </button>
  )
}