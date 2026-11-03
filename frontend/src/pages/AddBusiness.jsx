import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useAllCategories } from '../hooks/useAllCategories'
import { usePaymentMethods } from '../hooks/usePaymentMethods'
import { useListingFee } from '../hooks/useListingFee'
import { uploadBusinessPhotos } from '../lib/photos'
import FormPage, { Section } from '../components/FormPage'
import Field from '../components/Field'
import LocationPicker from '../components/LocationPicker'
import PhotoPicker from '../components/PhotoPicker'
import PaymentMethodPicker from '../components/PaymentMethodPicker'
import Button from '../components/Button'
import Icon from '../components/Icons'
import VideoPicker from '../components/VideoPicker'
import { uploadBusinessVideo } from '../lib/video'


const EMPTY = {
  name: '', description: '', category_id: '', city: '', subcity: '', address_text: '',
  phone: '', email: '', website: '', telegram: '', tiktok: '',
}

export default function AddBusiness() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const categories = useAllCategories()
  const { methods } = usePaymentMethods()
  const fee = useListingFee()

  const [form, setForm] = useState(EMPTY)
  const [pin, setPin] = useState(null)
  const [photos, setPhotos] = useState([])
  const [video, setVideo] = useState(null)
  const [paymentMethodId, setPaymentMethodId] = useState('')
  const [receiptFile, setReceiptFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // parents first, each followed by its children
  const ordered = useMemo(() => {
    const parents = categories.filter((c) => !c.parent_category_id)
    return parents.flatMap((p) => [p, ...categories.filter((c) => c.parent_category_id === p.id)])
  }, [categories])

  const bind = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (fee == null) return setError('Loading the listing fee, please try again')
    if (!pin) return setError('Please tap the map to set your business location')
    if (!paymentMethodId) return setError('Please choose how you paid')
    if (!receiptFile) return setError('Please upload your payment receipt')

    setSubmitting(true)
    try {
      // 1. create the business as pending
      const { data: business, error: bizError } = await supabase
        .from('businesses')
        .insert({
          ...form,
          owner_id: user.id,
          status: 'pending',
          location: `SRID=4326;POINT(${pin.lng} ${pin.lat})`,
        })
        .select()
        .single()
      if (bizError) throw bizError

      // 2. upload the receipt
      const filePath = `${user.id}/${business.id}-${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('payment-receipts')
        .upload(filePath, receiptFile)
      if (uploadError) throw uploadError

      // 3. create the payment record
      const { error: paymentError } = await supabase.from('payments').insert({
        business_id: business.id,
        payment_method_id: paymentMethodId,
        amount: fee,
        receipt_storage_path: filePath,
        status: 'pending',
      })
      if (paymentError) throw paymentError

      // photos are not critical: the business is already saved, the owner can add them later
      try {
        await uploadBusinessPhotos(business.id, photos)
      } catch (photoErr) {
        console.error(photoErr)
      }

            try {
        if (video) await uploadBusinessVideo(business.id, video)
      } catch (videoErr) {
        console.error(videoErr)
      }

      navigate('/account/my-businesses')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user) {
    return (
      <FormPage title="Add your business" back="/account" backLabel="Account">
        <Section>
          <p className="text-text-muted">Please log in to add a business.</p>
          <Link to="/login" className="text-brand-700 font-semibold">Log in</Link>
        </Section>
      </FormPage>
    )
  }

  const selected = methods.find((m) => m.id === paymentMethodId)

  return (
    <FormPage
      title="Add your business"
      subtitle="Fill in the details, pay once, and we'll review it"
      back="/account"
      backLabel="Account"
    >
      <div className="flex items-center gap-3 bg-brand-100 text-brand-900 rounded-2xl px-4 py-3 text-sm">
        <Icon name="card" className="w-5 h-5 shrink-0" />
        <span>
          One-time listing fee: <b>{fee ?? '...'} ETB</b>. Adding branches later is free.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Section title="Business details">
          <Field label="Business name" required {...bind('name')} />
          <Field label="Description" as="textarea" required {...bind('description')} />
          <Field label="Category" as="select" required {...bind('category_id')}>
            <option value="">Select a category</option>
            {ordered.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parent_category_id ? '— ' : ''}
                {c.name}
              </option>
            ))}
          </Field>
          <Field label="City" required {...bind('city')} />
          <Field label="Subcity" {...bind('subcity')} />
          <Field label="Address" {...bind('address_text')} />
        </Section>

        <Section title="Contact" hint="Add the ways customers can reach you. All optional.">
          <Field label="Phone" type="tel" {...bind('phone')} />
          <Field label="Email" type="email" {...bind('email')} />
          <Field label="Telegram" placeholder="@yourname" {...bind('telegram')} />
          <Field label="TikTok" placeholder="@yourname" {...bind('tiktok')} />
          <Field label="Website" {...bind('website')} />
        </Section>

        <Section title="Location on the map">
          <LocationPicker value={pin} onChange={setPin} />
        </Section>

                <Section title="Photos and video" hint="Optional. You can add more later.">
          <PhotoPicker files={photos} setFiles={setPhotos} />
          <VideoPicker file={video} setFile={setVideo} />
        </Section>

        <Section title="Payment" hint="Pick where you sent the money, then upload the receipt.">
          <PaymentMethodPicker methods={methods} value={paymentMethodId} onChange={setPaymentMethodId} />
          {selected && (
            <p className="text-sm text-brand-900">
              Send <b>{fee} ETB</b> to <b>{selected.account_number}</b> ({selected.account_name}), then upload the receipt.
            </p>
          )}
          <Field
            label="Payment receipt (photo or screenshot)"
            type="file"
            accept="image/*"
            required
            onChange={(e) => setReceiptFile(e.target.files[0])}
            className="file:mr-3 file:rounded-full file:border-0 file:bg-brand-900 file:text-white file:px-4 file:py-1.5 file:text-sm"
          />
        </Section>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? 'Submitting...' : 'Submit for review'}
        </Button>
      </form>
    </FormPage>
  )
}