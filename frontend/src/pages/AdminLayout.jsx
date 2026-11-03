import { useEffect, useState } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useIsAdmin } from '../hooks/useIsAdmin'
import Icon from '../components/Icons'

const NAV = [
  { to: '/admin', label: 'Overview', icon: 'shield', end: true },
  { to: '/admin/businesses', label: 'Businesses', icon: 'store' },
  { to: '/admin/payments', label: 'Payments', icon: 'card', badge: true },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
]

export default function AdminLayout() {
  const { isAdmin, loading } = useIsAdmin()
  const { pathname } = useLocation()
  const [pending, setPending] = useState(0)

  // number of payments waiting for review (shown as a red badge)
  useEffect(() => {
    if (!isAdmin) return
    supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => setPending(count || 0))
  }, [isAdmin, pathname])

  if (loading) return <p className="p-6 text-text-muted">Loading...</p>

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center p-6">
        <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
          <Icon name="shield" className="w-6 h-6" />
        </div>
        <p className="font-semibold text-brand-950">Admins only</p>
        <Link to="/" className="text-brand-700 font-semibold text-sm">Back to EthioFind</Link>
      </div>
    )
  }

  const sideLink = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition ${
      isActive ? 'bg-brand-400 text-brand-950' : 'text-brand-400 hover:bg-white/10 hover:text-white'
    }`

  const tabLink = ({ isActive }) =>
    `shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
      isActive ? 'bg-brand-400 text-brand-950' : 'bg-white/10 text-brand-400'
    }`

  const badge = (item) =>
    item.badge && pending > 0 && (
      <span className="ml-auto bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
        {pending}
      </span>
    )

  return (
    <div className="min-h-screen bg-bg">
      {/* sidebar (PC) */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 flex-col bg-brand-950 text-white p-5">
        <div className="mb-8 px-2">
          <p className="text-xl font-bold">EthioFind</p>
          <p className="text-brand-400 text-sm">Admin console</p>
        </div>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={sideLink}>
              <Icon name={item.icon} className="w-5 h-5" />
              {item.label}
              {badge(item)}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/"
          className="mt-auto flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-brand-400 hover:bg-white/10 hover:text-white transition"
        >
          <Icon name="back" className="w-5 h-5" /> Back to app
        </Link>
      </aside>

      {/* top bar + tabs (phone) */}
      <header className="md:hidden sticky top-0 z-30 bg-brand-950 text-white px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold">
            EthioFind <span className="text-brand-400 font-medium">Admin</span>
          </span>
          <Link to="/" className="flex items-center gap-1 text-xs text-brand-400">
            <Icon name="back" className="w-3.5 h-3.5" /> Back to app
          </Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto no-scrollbar">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={tabLink}>
              <Icon name={item.icon} className="w-4 h-4" />
              {item.label}
              {item.badge && pending > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">{pending}</span>
              )}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="md:pl-64">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}