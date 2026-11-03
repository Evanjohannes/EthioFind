import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import Button from '../components/Button'
import ContactSettings from '../components/ContactSettings'
const inputClass =
  'bg-bg border border-brand-400/60 rounded-2xl px-4 py-3 outline-none focus:border-brand-700 w-full'

const EMPTY = { method_type: '', account_name: '', account_number: '' }

export default function AdminSettings() {
  const [fee, setFee] = useState('')
  const [methods, setMethods] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const [{ data: s }, { data: m }] = await Promise.all([
      supabase.from('app_settings').select('value').eq('key', 'listing_fee').single(),
      supabase.from('payment_methods').select('*').order('created_at'),
    ])
    if (s) setFee(s.value)
    setMethods(m || [])
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function saveFee(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    const n = Number(fee)
    if (!n || n <= 0) return setError('Enter a fee greater than 0')

    const { error } = await supabase
      .from('app_settings')
      .update({ value: String(n), updated_at: new Date().toISOString() })
      .eq('key', 'listing_fee')

    if (error) setError(error.message)
    else setMessage('Listing fee saved. New submissions will use it.')
  }

  async function addMethod(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    const { error } = await supabase.from('payment_methods').insert(form)
    if (error) return setError(error.message)
    setForm(EMPTY)
    load()
  }

  async function toggleMethod(m) {
    const { error } = await supabase
      .from('payment_methods')
      .update({ is_active: !m.is_active })
      .eq('id', m.id)
    if (error) setError(error.message)
    else load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-950">Settings</h1>
      <p className="text-text-muted text-sm mb-6">Listing fee and the ways owners can pay</p>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {message && <p className="text-emerald-700 text-sm mb-3">{message}</p>}

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="bg-surface rounded-3xl p-5 shadow-card border border-brand-400/40">
          <h2 className="text-lg font-bold text-brand-950">Listing fee</h2>
          <p className="text-sm text-text-muted mt-1 mb-4">
            One-time fee to list a business. Payments already submitted keep their old amount.
          </p>
          <form onSubmit={saveFee} className="flex gap-2">
            <input
              type="number"
              min="1"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              className={inputClass}
            />
            <Button type="submit">Save</Button>
          </form>
        </section>

        <section className="bg-surface rounded-3xl p-5 shadow-card border border-brand-400/40">
          <h2 className="text-lg font-bold text-brand-950 mb-4">Add a payment method</h2>
          <form onSubmit={addMethod} className="flex flex-col gap-3">
            <input
              placeholder="Type (e.g. Bank (CBE), Telebirr)"
              required
              value={form.method_type}
              onChange={(e) => setForm({ ...form, method_type: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Account name"
              required
              value={form.account_name}
              onChange={(e) => setForm({ ...form, account_name: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Account number / phone number"
              required
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value })}
              className={inputClass}
            />
            <Button type="submit">Add method</Button>
          </form>
        </section>
      </div>


      <div className="mt-5">
  <ContactSettings />
</div>


      <h2 className="text-lg font-bold text-brand-950 mt-8 mb-3">Payment methods</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {methods.map((m) => (
          <div
            key={m.id}
            className="bg-surface rounded-3xl p-4 shadow-card border border-brand-400/40 flex justify-between items-center gap-3"
          >
            <div className={m.is_active ? '' : 'opacity-50'}>
              <p className="font-semibold text-brand-950">{m.method_type}</p>
              <p className="text-sm text-text-muted">{m.account_name}</p>
              <p className="text-sm text-brand-700 font-medium">{m.account_number}</p>
            </div>
            <button
              onClick={() => toggleMethod(m)}
              className="text-sm font-semibold text-brand-700 shrink-0"
            >
              {m.is_active ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}