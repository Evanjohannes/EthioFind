import { Link } from 'react-router-dom'
import Icon from './Icons'

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 pb-28">
      <Link to="/" className="flex items-center gap-3 mb-6">
        <span className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand-900 to-brand-950 text-white flex items-center justify-center shadow-soft">
          <Icon name="pin" className="w-6 h-6" />
        </span>
        <span className="text-2xl font-bold text-brand-950">EthioFind</span>
      </Link>

      <div className="w-full max-w-md bg-surface rounded-3xl p-6 md:p-8 shadow-soft border border-brand-400/40">
        <h1 className="text-2xl font-bold text-brand-950">{title}</h1>
        {subtitle && <p className="text-text-muted text-sm mt-1">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>

      {footer && <p className="text-sm text-text-muted mt-5">{footer}</p>}
    </div>
  )
}