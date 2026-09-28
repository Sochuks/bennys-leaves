import { BookForm } from '@/components/admin/BookForm'

export default function NewBookPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:py-14">
      <header className="mb-8">
        <h1 className="h1">Add a book</h1>
        <p className="body mt-2">
          Catalog one of Bernice's books by hand. Each book receives its BENNY ID automatically.
        </p>
      </header>
      <BookForm />
    </main>
  )
}