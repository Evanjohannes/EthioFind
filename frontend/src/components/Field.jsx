export default function Field({ label, as = 'input', className = '', children, ...props }) {
  const Tag = as
  return (
    <label className="block">
      {label && <span className="block text-sm font-medium text-brand-950 mb-1.5">{label}</span>}
      <Tag
        {...props}
        className={`bg-bg border border-brand-400/60 rounded-2xl px-4 py-3 outline-none focus:border-brand-700 focus:bg-surface w-full transition ${
          as === 'textarea' ? 'min-h-24' : ''
        } ${className}`}
      >
        {children}
      </Tag>
    </label>
  )
}