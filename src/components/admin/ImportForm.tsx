'use client'

import { useState, useTransition } from 'react'
import Papa from 'papaparse'
import { toast } from 'sonner'
import { bulkImportBooks } from '@/actions/books'
import type { ConditionTag, BulkImportRow } from '@/types/book'

type RawRow = Record<string, string>

type ValidatedRow = BulkImportRow & {
  rowNumber: number
  conditionDefaulted: boolean
  errors: string[]
  valid: boolean
}

// CSVs export condition labels in all kinds of shapes — "Like New", "like-new",
// "NEW". This normalizes loosely rather than demanding an exact enum match,
// since rejecting an otherwise-good row over capitalization would be a bad trade.
function normalizeCondition(raw: string): ConditionTag | null {
  const key = raw.trim().toUpperCase().replace(/[\s-]+/g, '_')
  if (['LIKE_NEW', 'NEW', 'LIKENEW'].includes(key)) return 'LIKE_NEW'
  if (['GENTLY_LOVED', 'GOOD', 'USED', 'GENTLYLOVED'].includes(key)) return 'GENTLY_LOVED'
  if (['WELL_TREASURED', 'WORN', 'FAIR', 'WELLTREASURED'].includes(key)) return 'WELL_TREASURED'
  return null
}

function parseCsv(file: File): Promise<RawRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      // Normalizes "Title" / "  Title " / "TITLE" all down to "title", so
      // the admin doesn't need to match our column names character-for-character.
      transformHeader: (header) => {
        const normalized = header.trim().toLowerCase().replace(/\s+/g, '_')
        return normalized === 'condition' ? 'condition_tag' : normalized
      },
      complete: (results) => resolve(results.data),
      error: reject,
    })
  })
}

function validateRows(rawRows: RawRow[]): ValidatedRow[] {
  return rawRows.map((raw, index) => {
    const title = (raw.title ?? '').trim()
    const author = (raw.author ?? '').trim()
    const isbn = (raw.isbn ?? '').trim()
    const category = (raw.category ?? '').trim()
    const description = (raw.description ?? '').trim()
    const conditionRaw = (raw.condition_tag ?? '').trim()
    const matchedCondition = normalizeCondition(conditionRaw)

    // Missing title/author blocks the row — there's nothing sensible to
    // insert without them. An unrecognized condition is a soft problem —
    // default it to Gently Loved and flag it, rather than throw the whole
    // row out over one unclear cell.
    const errors: string[] = []
    if (!title) errors.push('Missing title')
    if (!author) errors.push('Missing author')

    return {
      rowNumber: index + 2, // +2: spreadsheets are 1-indexed, and row 1 is the header
      title,
      author,
      isbn,
      category,
      condition_tag: matchedCondition ?? 'GENTLY_LOVED',
      description,
      conditionDefaulted: conditionRaw.length > 0 && matchedCondition === null,
      errors,
      valid: errors.length === 0,
    }
  })
}

export function ImportForm() {
  const [rows, setRows] = useState<ValidatedRow[] | null>(null)
  const [fileName, setFileName] = useState('')
  const [isImporting, startImport] = useTransition()
  const [importedCount, setImportedCount] = useState<number | null>(null)

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setImportedCount(null)

    try {
      const rawRows = await parseCsv(file)
      setRows(validateRows(rawRows))
    } catch {
      toast.error('Could not read that file', { description: "Make sure it's a plain CSV export." })
    }
  }

  function handleImport() {
    if (!rows) return
    const validRows = rows.filter((r) => r.valid)

    if (validRows.length === 0) {
      toast.error('Nothing to import', { description: 'Fix the flagged rows and re-upload.' })
      return
    }

    startImport(async () => {
      const result = await bulkImportBooks(
        validRows.map(({ title, author, isbn, category, condition_tag, description }) => ({
          title,
          author,
          isbn,
          category,
          condition_tag,
          description,
        }))
      )

      if (result.error) {
        toast.error('Import failed', { description: result.error })
        return
      }

      setImportedCount(result.insertedCount)
      toast.success(`${result.insertedCount} book${result.insertedCount === 1 ? '' : 's'} added`, {
        description: 'Check the Inventory tab to see them.',
      })
    })
  }

  const validCount = rows?.filter((r) => r.valid).length ?? 0
  const invalidCount = (rows?.length ?? 0) - validCount

  return (
    <div className="flex flex-col gap-6">
      <div className="card flex flex-col gap-3 p-6">
        <label htmlFor="csv-upload" className="ui-text">Upload a CSV file</label>
        <input id="csv-upload" type="file" accept=".csv" onChange={handleFile} />
        <span className="field-hint">
          Expected columns: title, author, isbn, category, condition, description.{' '}
          <a href="/benny-import-template.csv" download className="underline">Download a template</a>.
        </span>
      </div>

      {rows && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="body">
              {fileName} — <strong>{validCount}</strong> ready to import
              {invalidCount > 0 && (
                <span style={{ color: 'var(--color-terracotta-deep)' }}>, {invalidCount} need fixing</span>
              )}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleImport}
              disabled={isImporting || validCount === 0}
            >
              {isImporting ? 'Importing…' : `Import ${validCount} book${validCount === 1 ? '' : 's'}`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr><th>Row</th><th>Title</th><th>Author</th><th>Condition</th><th>Status</th></tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowNumber}>
                    <td className="mono-id">{row.rowNumber}</td>
                    <td className="body font-medium">{row.title || '—'}</td>
                    <td className="caption">{row.author || '—'}</td>
                    <td className="caption">
                      {row.condition_tag.replace('_', ' ')}
                      {row.conditionDefaulted && ' (defaulted)'}
                    </td>
                    <td>
                      {row.valid ? (
                        <span className="status-badge status-available"><span className="dot" />Ready</span>
                      ) : (
                        <span
                          className="status-badge"
                          style={{ background: 'var(--color-terracotta-tint)', color: 'var(--color-terracotta-deep)' }}
                        >
                          <span className="dot" />{row.errors.join(', ')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {importedCount !== null && (
        <p className="body" style={{ color: 'var(--color-olive)' }}>
          {importedCount} book{importedCount === 1 ? '' : 's'} added to the collection.
        </p>
      )}
    </div>
  )
}