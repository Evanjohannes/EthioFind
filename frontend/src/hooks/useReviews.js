import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useReviews(businessId) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })

    const list = data || []
    const ids = [...new Set(list.map((r) => r.user_id))]
    let names = {}
    if (ids.length) {
      const { data: profs } = await supabase.from('public_profiles').select('id, username').in('id', ids)
      names = Object.fromEntries((profs || []).map((p) => [p.id, p.username]))
    }
    setReviews(list.map((r) => ({ ...r, username: names[r.user_id] || 'Customer' })))
    setLoading(false)
  }, [businessId])

  useEffect(() => {
    load()
  }, [load])

  const myReview = user ? reviews.find((r) => r.user_id === user.id) : null

  async function saveReview(rating, comment) {
    const { error } = await supabase.from('reviews').upsert(
      {
        business_id: businessId,
        user_id: user.id,
        rating,
        comment: comment.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id,user_id' }
    )
    if (!error) await load()
    return { error }
  }

  async function deleteReview() {
    const { error } = await supabase.from('reviews').delete().eq('id', myReview.id)
    if (!error) await load()
    return { error }
  }

  return { reviews, myReview, loading, saveReview, deleteReview }
}