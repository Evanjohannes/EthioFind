import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useContactInfo() {
  const [info, setInfo] = useState({ phone: '', email: '', telegram: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('key, value')
      .in('key', ['contact_phone', 'contact_email', 'contact_telegram'])
      .then(({ data }) => {
        const m = Object.fromEntries((data || []).map((r) => [r.key, r.value]))
        setInfo({
          phone: m.contact_phone || '',
          email: m.contact_email || '',
          telegram: m.contact_telegram || '',
        })
        setLoading(false)
      })
  }, [])

  return { info, loading }
}