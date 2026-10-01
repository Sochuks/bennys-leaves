'use client'

import { useActionState, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ingestBook, type IngestBookState } from '@/actions/books'
import { lookupIsbn } from '@/actions/isbn-lookup'
import { Icon } from '../ui/Icon'
import { Add01Icon, Loading03Icon } from '@hugeicons/core-free-icons'

const initialState: IngestBookState = { status: 'idle', message: '', fields: {} }

type BookFormProps = {
  prefill?: Record<string, string>
}

export function BookForm({ prefill = {} }: BookFormProps) {
  const [state, formAction, isPending] = useActionState(ingestBook, initialState)
  const values = { ...prefill, ...state.fields }

  const titleRef = useRef<HTMLInputElement>(null)
  const authorRef = useRef<HTMLInputElement>(null)
  const isbnRef = useRef<HTMLInputElement>(null)
  const [coverUrl, setCoverUrl] = useState(values.cover_image_url ?? '')
  const [lookupNotice, setLookupNotice] = useState<string | null>(null)
  const [isLookingUp, startLookup] = useTransition()

  function handleLookup() {
    const isbn = isbnRef.current?.value.trim()
    if (!isbn) {
      toast.error('Enter an ISBN first')
      return
    }

    setLookupNotice(null)

    startLookup(async () => {
      const result = await lookupIsbn(isbn)

      if (result.found) {
        if (titleRef.current) titleRef.current.value = result.title
        if (authorRef.current) authorRef.current.value = result.author
        setCoverUrl(result.coverUrl)
        toast.success('Book found', { description: result.title })
      } else {
        setLookupNotice("Couldn't find that ISBN — fill in the details by hand.")
        toast.info("Couldn't find that ISBN", { description: 'Common with older or regional editions.' })
      }
    })
  }

  return (
    <form action={formAction} className="card flex flex-col gap-5 p-6 sm:p-8">
      {coverUrl && <img src={coverUrl} alt="" className="cover-preview" />}
      <input type="hidden" name="cover_image_url" value={coverUrl} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" type="text" ref={titleRef} defaultValue={values.title ?? ''} required />
        </div>
        <div className="field">
          <label htmlFor="author">Author</label>
          <input id="author" name="author" type="text" ref={authorRef} defaultValue={values.author ?? ''} required />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="field">
          <label htmlFor="isbn">ISBN</label>
          <div className="flex gap-2">
            <input
              id="isbn"
              name="isbn"
              type="text"
              inputMode="numeric"
              maxLength={13}
              ref={isbnRef}
              defaultValue={values.isbn ?? ''}
              className="flex-1"
            />
            <button type="button" onClick={handleLookup} disabled={isLookingUp} className="btn btn-secondary btn-sm">
              {isLookingUp ? 'Looking up…' : 'Look up'}
            </button>
          </div>
          <span className="field-hint">Paste the ISBN and click Look up to auto-fill the title, author, and cover.</span>
          {lookupNotice && (
            <span className="field-hint" style={{ color: 'var(--color-terracotta-deep)' }}>{lookupNotice}</span>
          )}
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <input id="category" name="category" type="text" placeholder="e.g. Devotional" defaultValue={values.category ?? ''} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="condition_tag">Condition</label>
        <select id="condition_tag" name="condition_tag" defaultValue={values.condition_tag ?? 'GENTLY_LOVED'} required>
          <option value="LIKE_NEW">Like New</option>
          <option value="GENTLY_LOVED">Gently Loved</option>
          <option value="WELL_TREASURED">Well-Treasured</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" defaultValue={values.description ?? ''} />
        <span className="field-hint">Optional. A line or two about the book.</span>
      </div>

      <button type="submit" disabled={isPending} className="btn btn-primary self-start">
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