import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Page from '../components/Page'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icons'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Notifications() {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const list = (data || []).map((n) => ({ ...n, isNew: !n.read_at }))
        setItems(list)
        setLoading(false)

        // opening the page marks everything as read
        const unread = list.filter((n) => n.isNew).map((n) => n.id)
        if (unread.length) {
          supabase
            .from('notifications')
            .update({ read_at: new Date().toISOString() })
            .in('id', unread)
            .then(() => {})
        }
      })
  }, [user])

  if (authLoading) return <Page><p className="text-text-muted">Loading...</p></Page>
  if (!user) return <Page><p className="text-text-muted">Please log in.</p></Page>

  return (
    <Page>
      <PageHeader back="/account" backLabel="Account" title="Notifications" subtitle="Updates about your listings" />

      <div className="mt-5 flex flex-col gap-3">
        {loading ? (
          <p className="text-text-muted text-sm">Loading...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
              <Icon name="bell" className="w-6 h-6" />
            </div>
            <p className="text-text-muted">No notifications yet.</p>
          </div>
        ) : (
          items.map((n) => (
            <div key={n.id} className="bg-surface rounded-3xl p-5 shadow-card border border-brand-400/40">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Icon name="trash" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-brand-950">{n.title}</h3>
                    {n.isNew && (
                      <span className="bg-brand-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-muted mt-0.5">
                    {n.branch_label || n.business_name} · {new Date(n.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {n.body && (
                <div className="mt-4 bg-red-50 rounded-2xl p-4">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Reason</p>
                  <p className="text-sm text-red-900 mt-1">{n.body}</p>
                </div>
              )}
            </div>
          ))
        )}

        <Link to="/contact" className="flex items-center justify-center gap-1 text-sm text-brand-700 font-semibold mt-3">
          Have a question? Contact us <Icon name="chevron" className="w-4 h-4" />
        </Link>
      </div>
    </Page>
  )
}