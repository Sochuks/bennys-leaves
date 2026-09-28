'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` },
    })

    if (error) setError(error.message)
    else setSent(true)
  }

  if (sent) {
    return <p className="body">Check your email — click the link to sign in.</p>
  }

  return (
    <form onSubmit={handleLogin} className="field" style={{ maxWidth: 360, margin: '80px auto' }}>
      <label htmlFor="email">Admin email</label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      {error && <p className="caption" style={{ color: 'var(--color-terracotta-deep)' }}>{error}</p>}
      <button type="submit" className="btn btn-primary">Send magic link</button>
    </form>
  )
}