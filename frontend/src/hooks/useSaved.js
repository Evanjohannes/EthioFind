import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useSaved() {
  const { user } = useAuth()
  const [savedIds, setSavedIds] = useState(new Set())
  const [savedBusinesses, setSavedBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  const loadSaved = useCallback(async () => {
    if (!user) {
      setSavedIds(new Set())
      setSavedBusinesses([])
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('saved_businesses')
      .select('business_id, businesses(*, categories(name), business_photos(storage_path, sort_order))')
      .eq('user_id', user.id)

    if (!error && data) {
      setSavedIds(new Set(data.map((d) => d.business_id)))
      setSavedBusinesses(data.map((d) => d.businesses))
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    loadSaved()
  }, [loadSaved])

  async function toggleSave(businessId) {
    if (!user) return { needsAuth: true }

    if (savedIds.has(businessId)) {
      await supabase.from('saved_businesses').delete()
        .eq('user_id', user.id).eq('business_id', businessId)
    } else {
      await supabase.from('saved_businesses').insert({ user_id: user.id, business_id: businessId })
    }
    await loadSaved()
    return { needsAuth: false }
  }

  return { savedIds, savedBusinesses, loading, toggleSave }
}