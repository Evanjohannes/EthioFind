import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useBusiness(id) {
  const [business, setBusiness] = useState(null)
  const [branches, setBranches] = useState([])
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    async function load() {
      const [{ data: biz }, { data: br }, { data: ph }] = await Promise.all([
        supabase.from('businesses').select('*, categories(name)').eq('id', id).single(),
        supabase.from('branches').select('*').eq('business_id', id),
        supabase.from('business_photos').select('*').eq('business_id', id).is('branch_id', null).order('sort_order'),
      ])
      setBusiness(biz)
      setBranches(br || [])
      setPhotos(ph || [])
      setLoading(false)
    }
    load()
  }, [id, tick])

  return { business, branches, photos, loading, reload: () => setTick((t) => t + 1) }
}