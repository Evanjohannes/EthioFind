import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export function useSearchHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])

  const load = useCallback(async () => {
    if (!user) return setHistory([])
    const { data } = await supabase
      .from('search_history')
      .select('id, query_text')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
    setHistory(data || [])
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  async function addSearch(text) {
    const q = text.trim()
    if (!user || !q) return
    // remove the same search if it already exists, so it moves to the top
    await supabase.from('search_history').delete()
      .eq('user_id', user.id).eq('query_text', q)
    await supabase.from('search_history').insert({ user_id: user.id, query_text: q })
    load()
  }

  async function removeSearch(id) {
    await supabase.from('search_history').delete().eq('id', id)
    load()
  }

  async function clearAll() {
    if (!user) return
    await supabase.from('search_history').delete().eq('user_id', user.id)
    load()
  }

  return { history, addSearch, removeSearch, clearAll }
}