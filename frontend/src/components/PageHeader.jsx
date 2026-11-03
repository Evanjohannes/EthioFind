import { Link } from 'react-router-dom'
import Icon from './Icons'

export default function PageHeader({ title, subtitle, back, backLabel, children }) {
  return (
    <div className="bg-linear-to-br from-brand-950 via-brand-900 to-brand-700 text-white rounded-3xl px-5 py-4 md:px-7 md:py-5 flex items-center justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link to={back} className="inline-flex items-center gap-1 text-xs text-brand-400 mb-1">
            <Icon name="back" className="w-3.5 h-3.5" /> {backLabel}
          </Link>
        )}
        <h1 className="text-xl md:text-2xl font-bold truncate">{title}</h1>
        {subtitle && <p className="text-brand-400 text-sm truncate">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}