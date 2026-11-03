import Page from './Page'
import PageHeader from './PageHeader'

export function Section({ title, hint, children }) {
  return (
    <section className="bg-surface rounded-3xl p-5 shadow-card border border-brand-400/40">
      {title && <h2 className="text-base font-bold text-brand-950">{title}</h2>}
      {hint && <p className="text-sm text-text-muted mt-0.5">{hint}</p>}
      <div className={`flex flex-col gap-4 ${title ? 'mt-4' : ''}`}>{children}</div>
    </section>
  )
}

export default function FormPage({ title, subtitle, back, backLabel, children }) {
  return (
    <Page>
      <PageHeader title={title} subtitle={subtitle} back={back} backLabel={backLabel} />
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </Page>
  )
}