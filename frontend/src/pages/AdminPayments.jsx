import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import Button from '../components/Button'
import Icon from '../components/Icons'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [receipts, setReceipts] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rejecting, setRejecting] = useState(null)
  const [reason, setReason] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('payments')
      .select('*, businesses(name, city, phone, description), payment_methods(method_type)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setPayments(data)

    const paths = data.map((p) => p.receipt_storage_path).filter(Boolean)
    if (paths.length) {
      const { data: signed } = await supabase.storage.from('payment-receipts').createSignedUrls(paths, 3600)
      setReceipts(Object.fromEntries((signed || []).map((s) => [s.path, s.signedUrl])))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function decide(id, status, notes = null) {
    setBusyId(id)
    setError('')
    const { error } = await supabase.rpc('approve_or_reject_payment', {
      payment_id: id,
      new_status: status,
      notes,
    })
    setBusyId(null)
    if (error) return setError(error.message)
    setRejecting(null)
    setReason('')
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-950">Payments</h1>
      <p className="text-text-muted text-sm mb-6">{payments.length} waiting for review</p>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

      {loading ? (
        <p className="text-text-muted text-sm">Loading...</p>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
            <Icon name="check" className="w-6 h-6" />
          </div>
          <p className="text-text-muted">All caught up. No pending payments.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {payments.map((p) => {
            const url = receipts[p.receipt_storage_path]
            return (
              <div key={p.id} className="bg-surface rounded-3xl p-4 shadow-card border border-brand-400/40 flex flex-col">
                {url ? (
                  <a href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt="Payment receipt" className="w-full h-44 object-cover rounded-2xl" />
                  </a>
                ) : (
                  <div className="w-full h-44 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center">
                    <Icon name="image" className="w-8 h-8" />
                  </div>
                )}

                <h3 className="font-semibold text-brand-950 mt-3">{p.businesses?.name}</h3>
                <p className="text-xs text-text-muted">
                  {p.businesses?.city} · {p.businesses?.phone || 'no phone'}
                </p>
                {p.businesses?.description && (
                  <p className="text-sm text-text mt-2 line-clamp-3">{p.businesses.description}</p>
                )}
                <p className="text-sm font-semibold text-brand-700 mt-2">
                  {p.amount} ETB via {p.payment_methods?.method_type}
                </p>

                {rejecting === p.id ? (
                  <div className="mt-4">
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Why is it rejected? The owner will see this."
                      className="bg-bg border border-brand-400/60 rounded-2xl px-4 py-3 outline-none focus:border-brand-700 w-full"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        variant="danger"
                        disabled={!reason.trim() || busyId === p.id}
                        onClick={() => decide(p.id, 'rejected', reason.trim())}
                      >
                        Confirm reject
                      </Button>
                      <Button variant="outline" onClick={() => { setRejecting(null); setReason('') }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-4">
                    <Button disabled={busyId === p.id} onClick={() => decide(p.id, 'approved')}>
                      Approve
                    </Button>
                    <Button variant="outline" onClick={() => setRejecting(p.id)}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}