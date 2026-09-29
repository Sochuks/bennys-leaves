'use server'

type OpenLibraryBook = {
  title?: string
  authors?: { key: string }[]
}

type OpenLibraryAuthor = {
  name?: string
}

export type IsbnLookupResult =
  | { found: true; title: string; author: string; coverUrl: string }
  | { found: false }

export async function lookupIsbn(isbn: string): Promise<IsbnLookupResult> {
  const cleanIsbn = isbn.replace(/[^0-9Xx]/g, '')

  try {
    const bookRes = await fetch(`https://openlibrary.org/isbn/${cleanIsbn}.json`, {
      signal: AbortSignal.timeout(5000),
    })

    if (!bookRes.ok) {
      return { found: false }
    }

    const book: OpenLibraryBook = await bookRes.json()

    // Open Library's book record doesn't include the author's name directly —
    // only a reference like { key: "/authors/OL23919A" }. Getting a readable
    // name means a second request to that author record. This is a real
    // shape of the API, not an extra step we're choosing to add.
    let authorName = 'Unknown Author'
    const authorKey = book.authors?.[0]?.key

    if (authorKey) {
      try {
        const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`, {
          signal: AbortSignal.timeout(5000),
        })
        if (authorRes.ok) {
          const author: OpenLibraryAuthor = await authorRes.json()
          authorName = author.name ?? authorName
        }
      } catch {
        // If the author lookup times out or fails, don't fail the whole
        // scan over it — the admin can type the author in by hand.
      }
    }

    return {
      found: true,
      title: book.title ?? '',
      author: authorName,
      // The Covers API accepts an ISBN directly — no need for a third
      // request. Caveat: if no cover exists, it returns a tiny 1x1
      // placeholder image instead of a 404, so this URL is a guess,
      // not a guarantee. The form below shows it as a preview the
      // admin can eyeball before saving.
      coverUrl: `https://covers.openlibrary.org/b/isbn/${cleanIsbn}-M.jpg`,
    }
  } catch (error) {
    console.error('[lookupIsbn] Open Library request failed:', error)
    return { found: false }
  }
}