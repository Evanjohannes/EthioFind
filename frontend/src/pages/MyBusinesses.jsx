import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Page from '../components/Page'
import PageHeader from '../components/PageHeader'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { photoUrl } from '../lib/photos'
import Icon from '../components/Icons'

const STATUS = {
  pending: { text: 'Waiting for approval', cls: 'bg-amber-100 text-amber-800' },
  active: { text: 'Live', cls: 'bg-emerald-100 text-emerald-800' },
  rejected: { text: 'Rejected', cls: 'bg-red-100 text-red-700' },
  hidden: { text: 'Hidden by admin', cls: 'bg-slate-200 text-slate-700' },
}

function Action({ to, icon, children }) {
  return (
    <Link
      to={to}
      className="flex-1 flex items-center justify-center gap-1.5 bg-brand-400/30 text-brand-900 text-xs font-semibold py-2.5 rounded-full hover:bg-brand-400/60 transition"
    >
      <Icon name={icon} className="w-4 h-4" /> {children}
    </Link>
  )
}

export default function MyBusinesses() {
  const { user, loading: authLoading } = useAuth()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    supabase
      .from('businesses')
      .select(
        '*, categories(name), business_photos(storage_path, sort_order, branch_id), branches(id), payments(status, admin_notes, created_at)'
      )
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setBusinesses(data)
        setLoading(false)
      })
  }, [user])

  if (authLoading) return <Page><p className="text-text-muted">Loading...</p></Page>
  if (!user) return <Page><p className="text-text-muted">Please log in.</p></Page>

  return (
    <Page wide>
      <PageHeader
        back="/account"
        backLabel="Account"
        title="My businesses"
        subtitle="Manage your listings, photos and branches"
      >
        <Link
          to="/add-business"
          className="shrink-0 flex items-center gap-1.5 bg-white text-brand-950 text-sm font-semibold px-4 py-2.5 rounded-full shadow-card"
        >
          <Icon name="plus" className="w-4 h-4" /> Add
        </Link>
      </PageHeader>

      <div className="mt-5">
        {loading ? (
          <p className="text-text-muted text-sm">Loading...</p>
        ) : businesses.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
              <Icon name="store" className="w-6 h-6" />
            </div>
            <p className="text-text-muted">You haven't added any business yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {businesses.map((b) => {
              const cover = [...(b.business_photos || [])].filter((p) => !p.branch_id).sort((x, y) => x.sort_order - y.sort_order)[0]
              const st = STATUS[b.status] || STATUS.pending
              const place = [b.subcity, b.city].filter(Boolean).join(', ')
              const adminNote = [...(b.payments || [])]
                .filter((p) => p.status === 'rejected' && p.admin_notes)
                .sort((x, y) => new Date(y.created_at) - new Date(x.created_at))[0]?.admin_notes
              const branchCount = b.branches?.length || 0

              return (
                <div key={b.id} className="bg-surface rounded-3xl p-4 shadow-card border border-brand-400/40">
                  <div className="flex gap-3">
                    {cover ? (
                      <img src={photoUrl(cover.storage_path)} alt="" className="w-20 h-20 rounded-2xl object-cover shrink-0" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-linear-to-br from-brand-400 to-brand-700 text-white flex items-center justify-center shrink-0">
                        <Icon name="store" className="w-7 h-7" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-brand-950 truncate">{b.name}</h3>
                      <span className={`inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full mt-1 ${st.cls}`}>
                        {st.text}
                      </span>
                      <p className="text-xs text-text-muted mt-1.5 truncate">
                        {b.categories?.name}
                        {place && ` · ${place}`}
                      </p>
                    </div>
                  </div>

                  {b.status === 'rejected' && (
                    <div className="mt-4">
                      {adminNote && (
                        <p className="text-sm text-red-700 bg-red-50 rounded-2xl p-3 mb-3">
                          <span className="font-semibold">Reason:</span> {adminNote}
                        </p>
                      )}
                      <Link
                        to={`/account/my-businesses/${b.id}/resubmit`}
                        className="block text-center text-sm font-semibold bg-linear-to-br from-brand-900 to-brand-950 text-white py-3 rounded-full shadow-soft"
                      >
                        Fix and resubmit
                      </Link>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Action to={`/account/my-businesses/${b.id}/edit`} icon="edit">Edit</Action>
                    <Action to={`/account/my-businesses/${b.id}/photos`} icon="image">Photos</Action>
                    <Action to={`/account/my-businesses/${b.id}/branches`} icon="layers">
                      Branches{branchCount > 0 && ` (${branchCount})`}
                    </Action>
                  </div>

                  {b.status === 'active' && (
                    <Link
                      to={`/business/${b.id}`}
                      className="flex items-center justify-center gap-1 text-sm text-brand-700 font-semibold mt-3"
                    >
                      View listing <Icon name="chevron" className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Page>
  )
}