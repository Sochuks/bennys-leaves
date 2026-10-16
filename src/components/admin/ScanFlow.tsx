'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ScannerView } from '@/components/admin/ScannerView'
import { BookForm } from '@/components/admin/BookForm'
import { lookupIsbn } from '@/actions/isbn-lookup'

type Stage = 'scanning' | 'looking-up' | 'reviewing'

export function ScanFlow() {
  const [stage, setStage] = useState<Stage>('scanning')
  const [prefill, setPrefill] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  function handleScan(isbn: string) {
    setStage('looking-up')

    startTransition(async () => {
      const result = await lookupIsbn(isbn)

      if (result.found) {
        toast.success('Book found', { description: result.title })
        setPrefill({ isbn, title: result.title, author: result.author, cover_image_url: result.coverUrl })
      } else {
        toast.info("Couldn't find that ISBN", {
          description: 'Fill in the details by hand — common with older or regional editions.',
        })
        setPrefill({ isbn })
      }

      setStage('reviewing')
    })
  }

  return (
    <div>
      <header className="mb-8">
        <h1 className="h1">Scan a Book</h1>
        <p className="body mt-2">Point the camera at the barcode on the back cover.</p>
      </header>

      {stage === 'scanning' && <ScannerView onScan={handleScan} />}
      {isPending && <p className="body mt-6">Looking up ISBN…</p>}
      {stage === 'reviewing' && !isPending && <BookForm prefill={prefill} />}
    </div>
  )
}