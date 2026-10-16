import { ImportForm } from '@/components/admin/ImportForm'
import { requireAdmin } from '@/lib/auth'

export default async function ImportBooksPage() {
  await requireAdmin()

  return (
    <div>
      <header className="mb-8">
        <h1 className="h1">Bulk Import</h1>
        <p className="body mt-2">
          Upload a CSV exported from a barcode-scanning app or spreadsheet. Review the preview before confirming.
        </p>
      </header>
      <ImportForm />
    </div>
  )
}