export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface rounded-2xl border border-brand-100 shadow-sm p-4 ${className}`}>
      {children}
    </div>
  )
}