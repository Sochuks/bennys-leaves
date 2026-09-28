'use client'

import { useActionState } from 'react'
import { ingestBook, type IngestBookState } from '@/actions/books'

const initialState: IngestBookState = { error: null, success: false }

export function BookForm() {
  const [state, formAction, isPending] = useActionState(ingestBook, initialState)

  return (
    <form action={formAction} className="field" style={{ maxWidth: 480, gap: 'var(--space-4)' }}>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" required />
      </div>

      <div className="field">
        <label htmlFor="author">Author</label>
        <input id="author" name="author" type="text" required />
      </div>

      <div className="field">
        <label htmlFor="isbn">ISBN (optional)</label>
        <input id="isbn" name="isbn" type="text" maxLength={13} />
      </div>

      <div className="field">
        <label htmlFor="category">Category</label>
        <input id="category" name="category" type="text" placeholder="e.g. Devotional" />
      </div>

      <div className="field">
        <label htmlFor="condition_tag">Condition</label>
        <select id="condition_tag" name="condition_tag" required defaultValue="GENTLY_LOVED">
          <option value="LIKE_NEW">Like New</option>
          <option value="GENTLY_LOVED">Gently Loved</option>
          <option value="WELL_TREASURED">Well-Treasured</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="description">Description (optional)</label>
        <textarea id="description" name="description" rows={3} />
      </div>

      {state.error && (
        <p className="caption" style={{ color: 'var(--color-terracotta-deep)' }}>{state.error}</p>
      )}
      {state.success && (
        <p className="caption" style={{ color: 'var(--color-olive)' }}>Book added to the collection.</p>
      )}

      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? 'Saving…' : 'Add Book'}
      </button>
    </form>
  )
}