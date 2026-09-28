'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isSending, setIsSending] = useState(false)

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSending(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error('Could not send the link', { description: error.message })
        return
      }

      toast.success('Check your email', {
        description: 'Click the link we sent to sign in.',
      })
    } catch {
      toast.error('Network problem', {
        description: 'Please check your connection and try again.',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5">
      <div className="card p-8">
        <h1 className="h2">Admin sign in</h1>
        <p className="caption mt-1.5">
          We'll email you a one-time link. No password to remember.
        </p>

        <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-4">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" disabled={isSending}>
            {isSending ? 'Sending…' : 'Send magic link'}
          </button>
        </form>
      </div>
    </main>
  )
}