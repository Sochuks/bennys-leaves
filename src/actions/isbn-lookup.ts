'use server'

import { checkAdmin } from '@/lib/auth'

type LookupHit = { title: string; author: string; coverUrl: string }

export type IsbnLookupResult = ({ found: true } & LookupHit) | { found: false }

type OpenLibraryBooksResponse = Record<
  string,
  {
    title?: string
    authors?: { name?: string }[]
    cover?: { large?: string; medium?: string; small?: string }
  }
>

async function lookupOpenLibrary(isbn: string): Promise<LookupHit | null> {
  try {
    const res = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return null

    // An unknown ISBN comes back as an empty object, not a 404.
    const data: OpenLibraryBooksResponse = await res.json()
    const book = data[`ISBN:${isbn}`]
    if (!book?.title) return null

    return {
      title: book.title,
      author: book.authors?.[0]?.name ?? 'Unknown Author',
      // Empty string when no real cover exists: the form simply shows no preview.
      coverUrl: book.cover?.medium ?? '',
    }
  } catch (error) {
    console.error('[lookupOpenLibrary] failed:', error)
    return null
  }
}

async function lookupGoogleBooks(isbn: string): Promise<LookupHit | null> {
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null

    const data: {
      items?: { volumeInfo?: { title?: string; authors?: string[]; imageLinks?: { thumbnail?: string } } }[]
    } = await res.json()

    const volume = data.items?.[0]?.volumeInfo
    if (!volume?.title) return null

    // Google returns http:// thumbnails; browsers block those on https pages.
    const rawCover = volume.imageLinks?.thumbnail
    const coverUrl = rawCover ? rawCover.replace(/^http:\/\//, 'https://') : ''

    return {
      title: volume.title,
      author: volume.authors?.[0] ?? 'Unknown Author',
      coverUrl,
    }
  } catch (error) {
    console.error('[lookupGoogleBooks] failed:', error)
    return null
  }
}

export async function lookupIsbn(isbn: string): Promise<IsbnLookupResult> {
  // Server Actions are public endpoints; without this, anyone could use your
  // server as a free proxy to these APIs.
  const admin = await checkAdmin()
  if (!admin.ok) return { found: false }

  const cleanIsbn = isbn.replace(/[^0-9Xx]/g, '').toUpperCase()
  if (cleanIsbn.length !== 10 && cleanIsbn.length !== 13) return { found: false }

  // Start Google immediately, but only wait for it if Open Library has nothing.
  // Both functions catch their own errors, so the un-awaited promise can never
  // cause an unhandled rejection.
  const googleLookup = lookupGoogleBooks(cleanIsbn)
  const hit = (await lookupOpenLibrary(cleanIsbn)) ?? (await googleLookup)

  return hit ? { found: true, ...hit } : { found: false }
}