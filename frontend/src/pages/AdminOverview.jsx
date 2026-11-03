import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Icon from '../components/Icons'

const count = (table, build) => {
  let q = supabase.from(table).select('*', { count: 'exact', head: true })
  if (build) q = build(q)
  return q.then(({ count }) => count || 0)
}

function Stat({ label, value, icon, to, accent }) {
  const body = (
    <div
      className={`bg-surface rounded-3xl p-5 shadow-card border border-brand-400/40 h-full ${
        to ? 'hover:shadow-soft transition' : ''
      }`}
    >
      <span
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          accent ? 'bg-amber-100 text-amber-700' : 'bg-brand-100 text-brand-900'
        }`}
      >
        <Icon name={icon} />
      </span>
      <p className="text-3xl font-bold text-brand-950 mt-3">{value ?? '–'}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  )
  return to ? <Link to={to}>{body}</Link> : body
}

export default function AdminOverview() {
  const [s, setS] = useState(null)

  useEffect(() => {
    Promise.all([
      count('businesses'),
      count('businesses', (q) => q.eq('status', 'active')),
      count('businesses', (q) => q.eq('status', 'pending')),
      count('businesses', (q) => q.eq('status', 'hidden')),
      count('businesses', (q) => q.eq('status', 'rejected')),
      count('profiles'),
      count('payments', (q) => q.eq('status', 'pending')),
      count('reviews'),
    ]).then(([total, live, pending, hidden, rejected, users, payments, reviews]) =>
      setS({ total, live, pending, hidden, rejected, users, payments, reviews })
    )
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-950">Overview</h1>
      <p className="text-text-muted text-sm mb-6">Everything happening on EthioFind</p>

      {s?.payments > 0 && (
        <Link
          to="/admin/payments"
          className="flex items-center justify-between gap-3 bg-amber-100 text-amber-900 rounded-2xl px-5 py-4 mb-6 font-medium"
        >
          <span>
            {s.payments} payment{s.payments === 1 ? '' : 's'} waiting for your review
          </span>
          <Icon name="chevron" className="w-5 h-5" />
        </Link>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="All businesses" value={s?.total} icon="store" to="/admin/businesses" />
        <Stat label="Live" value={s?.live} icon="check" to="/admin/businesses?status=active" />
        <Stat label="Waiting for approval" value={s?.pending} icon="clock" to="/admin/businesses?status=pending" accent />
        <Stat label="Hidden" value={s?.hidden} icon="shield" to="/admin/businesses?status=hidden" />
        <Stat label="Rejected" value={s?.rejected} icon="x" to="/admin/businesses?status=rejected" />
        <Stat label="Users" value={s?.users} icon="user" />
        <Stat label="Payments to review" value={s?.payments} icon="card" to="/admin/payments" accent />
        <Stat label="Ratings" value={s?.reviews} icon="star" />
      </div>
    </div>
  )
}