import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useBusinesses({ search = '', categoryIds = null, city = '', topRated = false } = {}) {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const categoryKey = categoryIds ? categoryIds.join(',') : ''

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    const timer = setTimeout(async () => {
      let query = supabase.rpc('search_listings', {
        search_text: search.trim(),
        category_ids: categoryIds?.length ? categoryIds : null,
        city_filter: city.trim(),
      })

      query = topRated
        ? query.order('rating_avg', { ascending: false }).order('rating_count', { ascending: false })
        : query.order('created_at', { ascending: false })

      const { data, error } = await query
      if (cancelled) return
      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      // cover photo: a branch uses its own photos, a business uses its main photos
      const covers = {}
      const ids = [...new Set(data.map((d) => d.business_id))]
      if (ids.length) {
        const { data: photos } = await supabase
          .from('business_photos')
          .select('business_id, branch_id, storage_path, sort_order')
          .in('business_id', ids)
          .order('sort_order')
        for (const p of photos || []) {
          const key = p.branch_id || p.business_id
          if (!covers[key]) covers[key] = p.storage_path
        }
      }
      if (cancelled) return

      setBusinesses(data.map((d) => ({ ...d, cover: covers[d.listing_id] || null })))
      setLoading(false)
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [search, categoryKey, city, topRated]) // eslint-disable-line

  return { businesses, loading }
}