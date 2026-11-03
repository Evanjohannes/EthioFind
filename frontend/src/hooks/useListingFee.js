import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useListingFee() {
  const [fee, setFee] = useState(null)

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'listing_fee')
      .single()
      .then(({ data }) => {
        if (data) setFee(Number(data.value))
      })
  }, [])

  return fee
}