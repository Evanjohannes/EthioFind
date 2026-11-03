import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'
import { useAllCategories } from '../hooks/useAllCategories'
import FormPage, { Section } from '../components/FormPage'
import Field from '../components/Field'
import LocationPicker from '../components/LocationPicker'
import Button from '../components/Button'
import Icon from '../components/Icons'

export default function EditBusiness() {
  const { id } = useParams()
  const { user } = useAuth()
  const categories = useAllCategories()
  const [business, setBusiness] = useState(null)
  const [form, setForm] = useState(null)
  const [pin, setPin] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const ordered = useMemo(() => {
    const parents = categories.filter((c) => !c.parent_category_id)
    return parents.flatMap((p) => [p, ...categories.filter((c) => c.parent_category_id === p.id)])
  }, [categories])

  useEffect(() => {
    supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (!data) return
        setBusiness(data)
        setForm({
          name: data.name || '',
          description: data.description || '',
          category_id: data.category_id || '',
          city: data.city || '',
          subcity: data.subcity || '',
          address_text: data.address_text || '',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          telegram: data.telegram || '',
          tiktok: data.tiktok || '',
        })
        if (data.lat != null) setPin({ lat: data.lat, lng: data.lng })
      })
  }, [id])

  const bind = (key) => ({
    value: form?.[key] ?? '',
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)

    const { error } = await supabase
      .from('businesses')
      .update({
        ...form,
        category_id: form.category_id || null,
        location: pin ? `SRID=4326;POINT(${pin.lng} ${pin.lat})` : undefined,
      })
      .eq('id', id)

    setSaving(false)
    if (error) setError(error.message)
    else setMessage('Saved!')
  }

  const wrap = (children) => (
    <FormPage title="Edit business" back="/account/my-businesses" backLabel="My businesses">
      {children}
    </FormPage>
  )

  if (!user) return wrap(<Section><p className="text-text-muted">Please log in.</p></Section>)
  if (!business || !form) return wrap(<Section><p className="text-text-muted">Loading...</p></Section>)
  if (business.owner_id !== user.id) {
    return wrap(<Section><p className="text-text-muted">This isn't your business.</p></Section>)
  }

  return (
    <FormPage
      title="Edit business"
      subtitle={business.name}
      back="/account/my-businesses"
      backLabel="My businesses"
    >
      <div className="grid grid-cols-2 gap-3">
        <Link
          to={`/account/my-businesses/${id}/photos`}
          className="flex items-center justify-center gap-2 bg-brand-400/30 text-brand-900 text-sm font-semibold py-3 rounded-full"
        >
          <Icon name="image" className="w-4 h-4" /> Photos
        </Link>
        <Link
          to={`/account/my-businesses/${id}/branches`}
          className="flex items-center justify-center gap-2 bg-brand-400/30 text-brand-900 text-sm font-semibold py-3 rounded-full"
        >
          <Icon name="layers" className="w-4 h-4" /> Branches
        </Link>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        <Section title="Business details">
          <Field label="Business name" required {...bind('name')} />
          <Field label="Description" as="textarea" {...bind('description')} />
          <Field label="Category" as="select" {...bind('category_id')}>
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

        <Section title="Contact">
          <Field label="Phone" type="tel" {...bind('phone')} />
          <Field label="Email" type="email" {...bind('email')} />
          <Field label="Telegram" placeholder="@yourname" {...bind('telegram')} />
          <Field label="TikTok" placeholder="@yourname" {...bind('tiktok')} />
          <Field label="Website" {...bind('website')} />
        </Section>

        <Section title="Location on the map">
          <LocationPicker value={pin} onChange={setPin} />
        </Section>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-emerald-700 text-sm font-medium">{message}</p>}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </FormPage>
  )
}