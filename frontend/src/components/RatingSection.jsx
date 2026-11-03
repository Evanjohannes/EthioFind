import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useReviews } from '../hooks/useReviews'
import Button from './Button'

function Stars({ value, onChange, size = 'text-3xl' }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={`${size} ${n <= value ? 'text-yellow-500' : 'text-brand-100'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function RatingSection({ business, onChanged }) {
  const { user } = useAuth()
  const { reviews, myReview, saveReview, deleteReview } = useReviews(business.id)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const isOwner = user?.id === business.owner_id

  useEffect(() => {
    setRating(myReview?.rating || 0)
    setComment(myReview?.comment || '')
  }, [myReview])

  async function handleSave() {
    if (!rating) return setError('Tap a star to choose your rating')
    setError('')
    setSaving(true)
    const { error } = await saveReview(rating, comment)
    setSaving(false)
    if (error) setError(error.message)
    else onChanged?.()
  }

  async function handleDelete() {
    const { error } = await deleteReview()
    if (error) setError(error.message)
    else {
      setRating(0)
      setComment('')
      onChanged?.()
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-text mb-3">Ratings & reviews</h2>

      {!user ? (
        <p className="text-sm text-text-muted">
          <Link to="/login" className="text-brand-700 font-medium underline">Log in</Link> or{' '}
          <Link to="/signup" className="text-brand-700 font-medium underline">sign up</Link> to rate this business.
        </p>
      ) : isOwner ? (
        <p className="text-sm text-text-muted">You can't rate your own business.</p>
      ) : (
        <div className="bg-surface border border-brand-100 rounded-2xl p-4">
          <p className="text-sm text-text-muted mb-2">
            {myReview ? 'Your rating' : 'Rate this business'}
          </p>
          <Stars value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment (optional)"
            className="border border-brand-100 rounded-2xl px-4 py-3 outline-none focus:border-brand-700 w-full mt-3"
          />
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
          <div className="flex gap-2 mt-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : myReview ? 'Update' : 'Submit'}
            </Button>
            {myReview && <Button variant="outline" onClick={handleDelete}>Remove</Button>}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 mt-4">
        {reviews.filter((r) => r.comment).map((r) => (
          <div key={r.id} className="border-b border-brand-100 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-text">{r.username}</span>
              <Stars value={r.rating} size="text-sm" />
            </div>
            <p className="text-sm text-text mt-1">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  )
}