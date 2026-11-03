import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function usePaymentMethods() {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('payment_methods')
      .select('*')
      .eq('is_active', true)
      .then(({ data, error }) => {
        if (!error) setMethods(data)
        setLoading(false)
      })
  }, [])

  return { methods, loading }
}