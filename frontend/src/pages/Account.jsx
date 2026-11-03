import { Link } from 'react-router-dom'
import Page from '../components/Page'
import Icon from '../components/Icons'
import { useAuth } from '../context/AuthContext'
import { useIsAdmin } from '../hooks/useIsAdmin'
import { useUnreadNotices } from '../hooks/useUnreadNotices'
import { supabase } from '../lib/supabaseClient'

const CARD =
  'bg-linear-to-br from-brand-950 via-brand-900 to-brand-700 text-white rounded-3xl px-5 py-4 md:px-7 md:py-5'

function Tile({ to, icon, title, sub }) {
  return (
    <Link
      to={to}
      className="bg-surface rounded-3xl p-4 shadow-card border border-brand-400/40 hover:shadow-soft transition flex flex-col gap-3"
    >
      <span className="w-10 h-10 rounded-2xl bg-linear-to-br from-brand-900 to-brand-950 text-white flex items-center justify-center">
        <Icon name={icon} />
      </span>
      <span>
        <span className="block font-semibold text-brand-950">{title}</span>
        <span className="block text-xs text-text-muted">{sub}</span>
      </span>
    </Link>
  )
}

function Row({ to, icon, title, badge = 0 }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 bg-surface rounded-2xl p-4 shadow-card border border-brand-400/40 hover:shadow-soft transition"
    >
      <span className="w-10 h-10 rounded-xl bg-brand-100 text-brand-900 flex items-center justify-center">
        <Icon name={icon} />
      </span>
      <span className="flex-1 font-medium text-brand-950">{title}</span>
      {badge > 0 && (
        <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badge}</span>
      )}
      <Icon name="chevron" className="w-4 h-4 text-brand-700" />
    </Link>
  )
}

export default function Account() {
  const { user, loading } = useAuth()
  const { isAdmin } = useIsAdmin()
  const unread = useUnreadNotices()

  if (loading) return <Page><p className="text-text-muted">Loading...</p></Page>

  if (!user) {
    return (
      <Page>
        <div className={CARD}>
          <h1 className="text-xl md:text-2xl font-bold">Welcome to EthioFind</h1>
          <p className="text-brand-400 text-sm mt-1">Save places, rate businesses and list your own.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link
            to="/signup"
            className="text-center bg-linear-to-br from-brand-900 to-brand-950 text-white font-semibold text-sm py-3 rounded-full shadow-soft"
          >
            Create account
          </Link>
          <Link
            to="/login"
            className="text-center border border-brand-400 text-brand-900 font-semibold text-sm py-3 rounded-full"
          >
            Log in
          </Link>
        </div>

        <div className="grid gap-3 mt-6 md:grid-cols-3">
          {[
            ['heart', 'Save your favorite places'],
            ['star', 'Rate and review businesses'],
            ['store', 'List your own business'],
          ].map(([icon, text]) => (
            <div
              key={text}
              className="flex items-center gap-3 bg-surface rounded-2xl p-4 shadow-card border border-brand-400/40"
            >
              <span className="w-10 h-10 rounded-xl bg-brand-100 text-brand-900 flex items-center justify-center shrink-0">
                <Icon name={icon} />
              </span>
              <span className="text-sm font-medium text-brand-950">{text}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Row to="/contact" icon="help" title="Help & support" />
        </div>
      </Page>
    )
  }

  const name = user.user_metadata?.username || user.email.split('@')[0]

  return (
    <Page>
      <div className={`${CARD} flex items-center gap-4`}>
        <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-lg font-bold uppercase shrink-0">
          {name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold truncate">{name}</h1>
            {isAdmin && (
              <span className="bg-brand-400 text-brand-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                ADMIN
              </span>
            )}
          </div>
          <p className="text-brand-400 text-sm truncate">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <Tile to="/account/my-businesses" icon="store" title="My businesses" sub="Manage your listings" />
        <Tile to="/add-business" icon="plus" title="Add business" sub="List yours today" />
      </div>

      <div className="flex flex-col gap-3 mt-3">
        <Row to="/saved" icon="heart" title="Saved places" />
        <Row to="/account/notifications" icon="bell" title="Notifications" badge={unread} />
        <Row to="/contact" icon="help" title="Help & support" />
        {isAdmin && <Row to="/admin" icon="shield" title="Admin console" />}
      </div>

      <button
        onClick={() => supabase.auth.signOut()}
        className="w-full flex items-center justify-center gap-2 mt-6 py-3 rounded-full border border-brand-400 text-brand-900 font-semibold text-sm hover:bg-brand-100 transition"
      >
        <Icon name="logout" className="w-4 h-4" /> Log out
      </button>
    </Page>
  )
}