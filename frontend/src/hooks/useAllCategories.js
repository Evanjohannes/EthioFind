import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useAllCategories() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    supabase
      .from('categories')
      .select('*')
      .order('sort_order')
      .then(({ data, error }) => {
        if (!error) setCategories(data)
      })
  }, [])

  return categories
}