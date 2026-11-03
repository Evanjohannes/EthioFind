import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { useListingFee } from '../hooks/useListingFee'
import FormPage, { Section } from '../components/FormPage'
import Field from '../components/Field'
import PaymentMethodPicker from '../components/PaymentMethodPicker'
import Button from '../components/Button'

export default function ResubmitPayment() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { methods } = usePaymentMethods()
  const fee = useListingFee()

  const [business, setBusiness] = useState(null)
  const [reason, setReason] = useState('')
  const [methodId, setMethodId] = useState('')
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const [{ data: b }, { data: p }] = await Promise.all([
        supabase.from('businesses').select('id, name, owner_id, status').eq('id', id).single(),
        supabase
          .from('payments')
          .select('admin_notes, created_at')
          .eq('business_id', id)
          .eq('status', 'rejected')
          .order('created_at', { ascending: false })
          .limit(1),
      ])
      setBusiness(b)
      setReason(p?.[0]?.admin_notes || '')
    }
    load()
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!methodId) return setError('Please choose how you paid')
    if (!file) return setError('Please upload your payment receipt')

    setBusy(true)
    const path = `${user.id}/${business.id}-${Date.now()}.jpg`

    const { error: uploadError } = await supabase.storage.from('payment-receipts').upload(path, file)
    if (uploadError) {
      setBusy(false)
      return setError(uploadError.message)
    }

    const { error: rpcError } = await supabase.rpc('resubmit_business', {
      p_business_id: business.id,
      p_payment_method_id: methodId,
      p_receipt_path: path,
    })

    if (rpcError) {
      await supabase.storage.from('payment-receipts').remove([path])
      setBusy(false)
      return setError(rpcError.message)
    }

    navigate('/account/my-businesses')
  }

  const wrap = (children, subtitle) => (
    <FormPage title="Resubmit" subtitle={subtitle} back="/account/my-businesses" backLabel="My businesses">
      {children}
    </FormPage>
  )

  if (!user) return wrap(<Section><p className="text-text-muted">Please log in.</p></Section>)
  if (!business) return wrap(<Section><p className="text-text-muted">Loading...</p></Section>)
  if (business.owner_id !== user.id) {
    return wrap(<Section><p className="text-text-muted">This isn't your business.</p></Section>)
  }
  if (business.status !== 'rejected') {
    return wrap(<Section><p className="text-text-muted">This business isn't waiting for a new payment.</p></Section>)
  }

  const selected = methods.find((m) => m.id === methodId)

  return wrap(
    <>
      {reason && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm text-red-700">
            <span className="font-semibold">Why it was rejected:</span> {reason}
          </p>
        </div>
      )}

      <p className="text-sm text-text-muted">
        You can fix your details first with Edit in My businesses, then upload a new receipt here.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Section title="Payment" hint={`Listing fee: ${fee ?? '...'} ETB`}>
          <PaymentMethodPicker methods={methods} value={methodId} onChange={setMethodId} />
          {selected && (
            <p className="text-sm text-brand-900">
              Send <b>{fee} ETB</b> to <b>{selected.account_number}</b> ({selected.account_name}), then upload the receipt.
            </p>
          )}
          <Field
            label="New payment receipt"
            type="file"
            accept="image/*"
            required
            onChange={(e) => setFile(e.target.files[0])}
            className="file:mr-3 file:rounded-full file:border-0 file:bg-brand-900 file:text-white file:px-4 file:py-1.5 file:text-sm"
          />
        </Section>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Submitting...' : 'Resubmit for review'}
        </Button>
      </form>
    </>,
    business.name
  )
}