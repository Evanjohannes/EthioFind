import Page from '../components/Page'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icons'
import { useContactInfo } from '../hooks/useContactInfo'
import { href, shown } from '../lib/contact'

export default function Contact() {
  const { info, loading } = useContactInfo()

  const items = [
    info.phone && { icon: 'phone', label: 'Call us', value: info.phone, url: href('phone', info.phone) },
    info.telegram && {
      icon: 'send',
      label: 'Telegram',
      value: shown('telegram', info.telegram),
      url: href('telegram', info.telegram),
      external: true,
    },
    info.email && { icon: 'mail', label: 'Email', value: info.email, url: href('email', info.email) },
  ].filter(Boolean)

  return (
    <Page>
      <PageHeader
        back="/account"
        backLabel="Account"
        title="Help & support"
        subtitle="Questions? Reach us any of these ways"
      />

      <div className="mt-5 flex flex-col gap-3">
        {loading ? (
          <p className="text-text-muted text-sm">Loading...</p>
        ) : items.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-3">
              <Icon name="help" className="w-6 h-6" />
            </div>
            <p className="text-text-muted">Contact details will appear here soon.</p>
          </div>
        ) : (
          items.map((c) => (
            <a
              key={c.label}
              href={c.url}
              target={c.external ? '_blank' : undefined}
              rel="noreferrer"
              className="flex items-center gap-4 bg-surface rounded-3xl p-5 shadow-card border border-brand-400/40 hover:shadow-soft transition"
            >
              <span className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand-900 to-brand-950 text-white flex items-center justify-center shrink-0">
                <Icon name={c.icon} className="w-6 h-6" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-xs text-text-muted">{c.label}</span>
                <span className="block font-semibold text-brand-950 break-words">{c.value}</span>
              </span>
              <Icon name="chevron" className="w-4 h-4 text-brand-700 shrink-0" />
            </a>
          ))
        )}
      </div>
    </Page>
  )
}