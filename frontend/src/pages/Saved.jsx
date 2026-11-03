import { Link, useNavigate } from 'react-router-dom'
import Page from '../components/Page'
import PageHeader from '../components/PageHeader'
import BusinessCard from '../components/BusinessCard'
import Icon from '../components/Icons'
import { useSaved } from '../hooks/useSaved'
import { useAuth } from '../context/AuthContext'
import { businessToListing } from '../lib/listings'

export default function Saved() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { savedIds, savedBusinesses, loading, toggleSave } = useSaved()

  async function handleToggle(id) {
    const result = await toggleSave(id)
    if (result.needsAuth) navigate('/signup')
  }

  const items = savedBusinesses.filter(Boolean).map(businessToListing)

  return (
    <Page wide>
      <PageHeader
        title="Saved"
        subtitle={user ? `${items.length} place${items.length === 1 ? '' : 's'}` : 'Your favorite places'}
      />

      <div className="mt-5">
        {!user ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
              <Icon name="heart" className="w-6 h-6" />
            </div>
            <p className="text-text-muted mb-4">Sign up or log in to save businesses.</p>
            <Link to="/signup" className="inline-block bg-brand-900 text-white font-semibold text-sm px-6 py-3 rounded-full">
              Create account
            </Link>
          </div>
        ) : loading ? (
          <p className="text-text-muted text-sm">Loading...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
              <Icon name="heart" className="w-6 h-6" />
            </div>
            <p className="text-text-muted">Nothing saved yet. Tap the heart on any business.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((l) => (
              <BusinessCard
                key={l.listing_id}
                listing={l}
                saved={savedIds.has(l.business_id)}
                onToggleSave={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </Page>
  )
}