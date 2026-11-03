import { useState } from 'react'
import Icon from './Icons'

export default function DeleteWithReason({ title, warning, busy, error, onConfirm, onClose }) {
  const [reason, setReason] = useState('')
  const ready = reason.trim().length >= 5

  return (
    <div
      className="fixed inset-0 z-50 bg-brand-950/50 flex items-center justify-center p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        className="bg-surface rounded-3xl p-6 w-full max-w-sm max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <Icon name="trash" />
        </div>
        <h2 className="text-lg font-bold text-brand-950">{title}</h2>
        <p className="text-sm text-text-muted mt-2">{warning}</p>

        <label className="block mt-4">
          <span className="block text-sm font-medium text-brand-950 mb-1.5">
            Reason (the owner will see this)
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is it being removed?"
            className="bg-bg border border-brand-400/60 rounded-2xl px-4 py-3 outline-none focus:border-brand-700 w-full min-h-24"
          />
        </label>

        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={busy}
            className="flex-1 py-3 rounded-full border border-brand-400 text-brand-900 font-semibold text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason.trim())}
            disabled={!ready || busy}
            className="flex-1 py-3 rounded-full bg-red-600 text-white font-semibold text-sm disabled:opacity-50"
          >
            {busy ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}