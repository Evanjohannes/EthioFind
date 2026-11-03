import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import AuthShell from '../components/AuthShell'
import Field from '../components/Field'
import Button from '../components/Button'

export default function VerifyOtp() {
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    const { error } = await supabase.auth.verifyOtp({ email, token: code.trim(), type: 'signup' })
    setBusy(false)
    if (error) setError(error.message)
    else navigate('/account')
  }

  async function resend() {
    setError('')
    setInfo('')
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    if (error) setError(error.message)
    else setInfo('A new code was sent to your email.')
  }

  if (!email) {
    return (
      <AuthShell title="Verify your email">
        <p className="text-text-muted text-sm mb-4">Please sign up first so we know where to send the code.</p>
        <Link to="/signup" className="text-brand-700 font-semibold">Go to sign up</Link>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Check your email"
      subtitle={`We sent a code to ${email}. Enter it below.`}
      footer={
        <>
          Didn't get it?{' '}
          <button onClick={resend} className="text-brand-700 font-semibold">Resend code</button>
        </>
      }
    >
      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        <Field
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          placeholder="123456"
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="text-center text-2xl tracking-[0.4em] font-semibold"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        {info && <p className="text-emerald-700 text-sm">{info}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    </AuthShell>
  )
}