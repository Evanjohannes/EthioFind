import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import AuthShell from '../components/AuthShell'
import Field from '../components/Field'
import Button from '../components/Button'

export default function Signup() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function handleSignup(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) return setError("Passwords don't match")

    setBusy(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    })
    setBusy(false)

    if (error) {
      setError(
        /database error/i.test(error.message)
          ? 'That username is already taken. Try a different one.'
          : error.message
      )
    } else {
      navigate('/verify-otp', { state: { email } })
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save places, rate businesses and list your own"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="text-brand-700 font-semibold">Log in</Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <Field label="Username" autoComplete="username" required value={username}
          onChange={(e) => setUsername(e.target.value)} />
        <Field label="Email" type="email" autoComplete="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <Field label="Password" type="password" autoComplete="new-password" minLength={6} required
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <Field label="Confirm password" type="password" autoComplete="new-password" required
          value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Creating account...' : 'Sign up'}
        </Button>
      </form>
    </AuthShell>
  )
}