import Link from 'next/link'
import { getBooks } from '@/lib/queries/books'
import { requireAdmin } from '@/lib/auth'
import { InventoryTable } from '@/components/admin/InventoryTable'
import { EmptyState } from '@/components/ui/EmptyState'

export default async function BooksPage() {
  await requireAdmin()
  const books = await getBooks()

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="h1">Inventory</h1>
          <p className="body mt-1">
            {books.length} book{books.length === 1 ? '' : 's'} catalogued
          </p>
        </div>
        <Link href="/admin/books/new" className="btn btn-primary">Add Book</Link>
      </header>

      {books.length === 0 ? (
        <EmptyState
          title="No books yet"
          description="Add your first book to start building Bernice's digital shelf."
        />
      ) : (
        <InventoryTable books={books} />
      )}
    </div>
  )
}