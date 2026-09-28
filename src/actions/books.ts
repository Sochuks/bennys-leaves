'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { bookSchema } from '@/lib/validations/book'

const FIELD_NAMES = [
  'title',
  'author',
  'isbn',
  'category',
  'condition_tag',
  'description',
] as const

type FieldName = (typeof FIELD_NAMES)[number]

export type IngestBookState = {
  status: 'idle' | 'success' | 'error'
  message: string
  fields: Partial<Record<FieldName, string>>
}

function readFields(formData: FormData): Record<FieldName, string> {
  const fields = {} as Record<FieldName, string>
  for (const name of FIELD_NAMES) {
    const value = formData.get(name)
    fields[name] = typeof value === 'string' ? value.trim() : ''
  }
  return fields
}

export async function ingestBook(
  _previousState: IngestBookState,
  formData: FormData
): Promise<IngestBookState> {
  const fields = readFields(formData)
  const parsed = bookSchema.safeParse(fields)

  if (!parsed.success) {
    return {
      status: 'error',
      message: parsed.error.issues[0]?.message ?? 'Please check the form and try again.',
      fields,
    }
  }

  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        status: 'error',
        message: 'You are signed out. Please sign in again.',
        fields,
      }
    }

    const { error } = await supabase.from('books').insert({
      title: parsed.data.title,
      author: parsed.data.author,
      isbn: parsed.data.isbn || null,
      category: parsed.data.category || null,
      condition_tag: parsed.data.condition_tag,
      description: parsed.data.description || null,
    })

    if (error) {
      console.error('[ingestBook] insert failed:', error)
      return {
        status: 'error',
        // 42501 is Postgres's "insufficient_privilege" code, which is what an RLS rejection returns
        message:
          error.code === '42501'
            ? 'Your account does not have permission to add books.'
            : 'Could not save the book. Please try again.',
        fields,
      }
    }
  } catch (error) {
    console.error('[ingestBook] unexpected failure:', error)
    return {
      status: 'error',
      message: 'Something went wrong on our side. Please try again.',
      fields,
    }
  }

  revalidatePath('/admin/books')

  return {
    status: 'success',
    message: `"${parsed.data.title}" was added to the collection.`,
    fields: {},
  }
}