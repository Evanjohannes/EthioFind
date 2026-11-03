export default function PaymentMethodPicker({ methods, value, onChange }) {
  if (methods.length === 0) {
    return <p className="text-sm text-text-muted">No payment method is available right now. Please try again later.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {methods.map((m) => (
        <button
          type="button"
          key={m.id}
          onClick={() => onChange(m.id)}
          className={`text-left rounded-2xl border p-4 transition ${
            value === m.id
              ? 'border-brand-900 bg-brand-100'
              : 'border-brand-400/60 bg-bg hover:bg-brand-100/60'
          }`}
        >
          <span className="block font-semibold text-brand-950">{m.method_type}</span>
          <span className="block text-sm text-text-muted">{m.account_name}</span>
          <span className="block text-sm font-semibold text-brand-700">{m.account_number}</span>
        </button>
      ))}
    </div>
  )
}