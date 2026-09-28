'use server'

import { createClient } from '@/lib/supabase/server'
import { bookSchema } from '@/lib/validations/book'
import { revalidatePath } from 'next/cache'

export type IngestBookState = {
  error: string | null
  success: boolean
}

export async function ingestBook(
  prevState: IngestBookState,
  formData: FormData
): Promise<IngestBookState> {
  const raw = {
    title: formData.get('title'),
    author: formData.get('author'),
    isbn: formData.get('isbn'),
    category: formData.get('category'),
    condition_tag: formData.get('condition_tag'),
    description: formData.get('description'),
  }

  const parsed = bookSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createClient()

  const { error } = await supabase.from('books').insert({
    title: parsed.data.title,
    author: parsed.data.author,
    isbn: parsed.data.isbn || null,
    category: parsed.data.category || null,
    condition_tag: parsed.data.condition_tag,
    description: parsed.data.description || null,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/admin/books')
  return { error: null, success: true }
}