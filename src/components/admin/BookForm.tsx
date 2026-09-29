'use client'

import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Loading03Icon,
  Add01Icon,
} from '@hugeicons/core-free-icons'

import { Icon } from '@/components/ui/Icon'
import { ingestBook, type IngestBookState } from '@/actions/books'

const initialState: IngestBookState = {
  status: 'idle',
  message: '',
  fields: {},
}

type BookFormProps = {
  prefill?: Record<string, string>
}

export function BookForm({ prefill = {} }: BookFormProps) {
  const [state, formAction, isPending] = useActionState(
    ingestBook,
    initialState
  )
  const values = { ...prefill, ...state.fields }

  useEffect(() => {
    if (state.status === 'success') {
      toast.success('Book added', {
        description: state.message,
      })
    }

    if (state.status === 'error') {
      toast.error('Could not add book', {
        description: state.message,
      })
    }
  }, [state])

  return (
    <form action={formAction} className="card flex flex-col gap-5 p-6 sm:p-8">
      {values.cover_image_url && (
        <img src={values.cover_image_url} alt="" className="cover-preview" />
      )}
      <input type="hidden" name="cover_image_url" value={values.cover_image_url ?? ''} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            type="text"
            defaultValue={values.title ?? ''}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="author">Author</label>
          <input
            id="author"
            name="author"
            type="text"
            defaultValue={values.author ?? ''}
            required
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="isbn">ISBN</label>
          <input
            id="isbn"
            name="isbn"
            type="text"
            inputMode="numeric"
            maxLength={13}
            defaultValue={values.isbn ?? ''}
          />
          <span className="field-hint">
            Optional. Digits only, no dashes.
          </span>
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <input
            id="category"
            name="category"
            type="text"
            placeholder="e.g. Devotional"
            defaultValue={values.category ?? ''}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="condition_tag">Condition</label>
        <select
          id="condition_tag"
          name="condition_tag"
          defaultValue={values.condition_tag ?? 'GENTLY_LOVED'}
          required
        >
          <option value="LIKE_NEW">Like New</option>
          <option value="GENTLY_LOVED">Gently Loved</option>
          <option value="WELL_TREASURED">Well-Treasured</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue={values.description ?? ''}
        />
        <span className="field-hint">
          Optional. A line or two about the book.
        </span>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary self-start pl-5 pr-[22px]"
      >
        {isPending ? (
          <Icon
            icon={Loading03Icon}
            size={16}
            strokeWidth={1.8}
            className="animate-spin"
          />
        ) : (
          <Icon
            icon={Add01Icon}
            size={16}
            strokeWidth={1.8}
          />
        )}

        {isPending ? 'Saving…' : 'Add book'}
      </button>
    </form>
  )
}