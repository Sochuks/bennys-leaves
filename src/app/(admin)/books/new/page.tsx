import { BookForm } from '@/components/admin/BookForm'

export default function NewBookPage() {
  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <h1 className="h1" style={{ marginBottom: 'var(--space-6)' }}>Add a Book</h1>
      <BookForm />
    </div>
  )
}