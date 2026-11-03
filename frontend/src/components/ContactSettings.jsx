import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Field from './Field'
import Button from './Button'

const KEYS = ['contact_phone', 'contact_email', 'contact_telegram']

export default function ContactSettings() {
  const [form, setForm] = useState({ phone: '', email: '', telegram: '' })
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('app_settings')
      .select('key, value')
      .in('key', KEYS)
      .then(({ data }) => {
        const m = Object.fromEntries((data || []).map((r) => [r.key, r.value]))
        setForm({
          phone: m.contact_phone || '',
          email: m.contact_email || '',
          telegram: m.contact_telegram || '',
        })
      })
  }, [])

  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    const now = new Date().toISOString()
    const rows = [
      { key: 'contact_phone', value: form.phone.trim(), updated_at: now },
      { key: 'contact_email', value: form.email.trim(), updated_at: now },
      { key: 'contact_telegram', value: form.telegram.trim(), updated_at: now },
    ]
    const { error } = await supabase.from('app_settings').upsert(rows, { onConflict: 'key' })
    setBusy(false)
    if (error) setError(error.message)
    else setMessage('Contact details saved. They now show on the Help & support page.')
  }

  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  return (
    <section className="bg-surface rounded-3xl p-5 shadow-card border border-brand-400/40">
      <h2 className="text-lg font-bold text-brand-950">Your contact information</h2>
      <p className="text-sm text-text-muted mt-1 mb-4">
        Shown to users on the Help &amp; support page so they can reach you with questions.
      </p>
      <form onSubmit={save} className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Phone number" type="tel" placeholder="+251 9..." {...bind('phone')} />
          <Field label="Email" type="email" {...bind('email')} />
          <Field label="Telegram" placeholder="@yourname" {...bind('telegram')} />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-emerald-700 text-sm">{message}</p>}
        <Button type="submit" disabled={busy} className="md:self-start">
          {busy ? 'Saving...' : 'Save contact details'}
        </Button>
      </form>
    </section>
  )
}