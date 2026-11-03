import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .is('parent_category_id', null) // top-level only, for the Discover chips
      .order('sort_order')
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setCategories(data)
        setLoading(false)
      })
  }, [])

  return { categories, loading }
}