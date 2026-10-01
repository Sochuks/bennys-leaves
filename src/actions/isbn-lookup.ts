'use server'

type LookupHit = { title: string; author: string; coverUrl: string }

export type IsbnLookupResult = ({ found: true } & LookupHit) | { found: false }

async function lookupOpenLibrary(isbn: string): Promise<LookupHit | null> {
  try {
    const bookRes = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!bookRes.ok) return null

    const book: { title?: string; authors?: { key: string }[] } = await bookRes.json()
    if (!book.title) return null

    let authorName = 'Unknown Author'
    const authorKey = book.authors?.[0]?.key

    if (authorKey) {
      try {
        const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`, {
          signal: AbortSignal.timeout(5000),
        })
        if (authorRes.ok) {
          const author: { name?: string } = await authorRes.json()
          authorName = author.name ?? authorName
        }
      } catch {
        // Leave it as 'Unknown Author' — not worth failing the whole lookup over.
      }
    }

    return {
      title: book.title,
      author: authorName,
      coverUrl: `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`,
    }
  } catch {
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

    // Google Books returns cover thumbnails as http://, which your production
    // https:// site will silently block as "mixed content." Force https
    // before this ever reaches an <img> tag.
    const rawCover = volume.imageLinks?.thumbnail
    const coverUrl = rawCover ? rawCover.replace(/^http:\/\//, 'https://') : ''

    return {
      title: volume.title,
      author: volume.authors?.[0] ?? 'Unknown Author',
      coverUrl,
    }
  } catch {
    return null
  }
}

export async function lookupIsbn(isbn: string): Promise<IsbnLookupResult> {
  const cleanIsbn = isbn.replace(/[^0-9Xx]/g, '')

  // Sequential, not parallel, on purpose: Google Books is only worth the
  // extra network round-trip when Open Library genuinely has nothing.
  const hit = (await lookupOpenLibrary(cleanIsbn)) ?? (await lookupGoogleBooks(cleanIsbn))

  return hit ? { found: true, ...hit } : { found: false }
}