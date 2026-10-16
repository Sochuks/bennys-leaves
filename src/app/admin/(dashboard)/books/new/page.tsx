import { BookForm } from '@/components/admin/BookForm'
import { requireAdmin } from '@/lib/auth'

export default async function NewBookPage() {
  await requireAdmin()

  return (
    <div>
      <header className="mb-8">
        <h1 className="h1">Add a book</h1>
        <p className="body mt-2">
          Catalog one of Bernice's books by hand. Each book receives its BENNY ID automatically.
        </p>
      </header>
      <BookForm />
    </div>
  )
}