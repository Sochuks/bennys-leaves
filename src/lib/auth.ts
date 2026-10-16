import { cache } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AdminCheck =
  | { ok: true; userId: string }
  | { ok: false; reason: 'signed-out' | 'not-admin' }

// React's cache() memoizes per request: calling this from the layout AND the
// page costs one database round trip, not two.
export const checkAdmin = cache(async (): Promise<AdminCheck> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, reason: 'signed-out' }

  // Same is_admin() function your RLS policies use, so the app and the
  // database always agree on who counts as an admin.
  const { data: isAdmin, error } = await supabase.rpc('is_admin')
  if (error || !isAdmin) return { ok: false, reason: 'not-admin' }

  return { ok: true, userId: user.id }
})

// For pages: redirects instead of returning.
export async function requireAdmin(): Promise<string> {
  const result = await checkAdmin()
  if (!result.ok) redirect('/admin/login')
  return result.userId
}