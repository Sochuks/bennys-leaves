import { createClient } from '@/lib/supabase/server'
import type { Book } from '@/types/book'

export async function getBooks(): Promise<Book[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getBooks] failed to load inventory:', error)
    return []
  }

  return data ?? []
}