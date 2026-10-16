'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { bookSchema } from '@/lib/validations/book'
import type { BulkImportRow } from '@/types/book'
import { checkAdmin } from '@/lib/auth'

const FIELD_NAMES = [
  'title',
  'author',
  'isbn',
  'category',
  'condition_tag',
  'description',
  'cover_image_url',
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

  const admin = await checkAdmin()
  if (!admin.ok) {
    return {
      status: 'error',
      message: 'You are signed out or not an admin. Please sign in again.',
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
      cover_image_url: parsed.data.cover_image_url || null,
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

export async function bulkImportBooks(
  rows: BulkImportRow[]
): Promise<{ insertedCount: number; error: string | null }> {
  if (rows.length === 0) {
    return { insertedCount: 0, error: 'No rows to import.' }
  }

  try {
    const supabase = await createClient()

    const admin = await checkAdmin()
    if (!admin.ok) {
      return { insertedCount: 0, error: 'You are signed out or not an admin. Please sign in again.' }
    }

    // One insert call carrying an array of rows, not a loop of individual
    // inserts — this is a single network round-trip, and Postgres treats
    // a multi-row INSERT as one statement: if any row fails a constraint,
    // the whole batch rolls back together rather than leaving you with a
    // partial import to untangle.
    const { error, count } = await supabase
      .from('books')
      .insert(
        rows.map((r) => ({
          title: r.title,
          author: r.author,
          isbn: r.isbn || null,
          category: r.category || null,
          condition_tag: r.condition_tag,
          description: r.description || null,
        })),
        { count: 'exact' }
      )

    if (error) {
      console.error('[bulkImportBooks] insert failed:', error)
      return {
        insertedCount: 0,
        error:
          error.code === '42501'
            ? 'Your account does not have permission to add books.'
            : 'Could not save the books. Please try again.',
      }
    }

    revalidatePath('/admin/books')
    return { insertedCount: count ?? rows.length, error: null }
  } catch (error) {
    console.error('[bulkImportBooks] unexpected failure:', error)
    return { insertedCount: 0, error: 'Something went wrong on our side. Please try again.' }
  }
}