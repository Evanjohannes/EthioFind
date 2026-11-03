export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-linear-to-br from-brand-900 to-brand-950 text-white shadow-soft hover:brightness-110',
    secondary: 'bg-brand-400/40 text-brand-900 hover:bg-brand-400/70',
    outline: 'border border-brand-400 text-brand-900 hover:bg-brand-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}