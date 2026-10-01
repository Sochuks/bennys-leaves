'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

const SCANNER_ELEMENT_ID = 'isbn-scanner-viewport'

type ScannerViewProps = {
  onScan: (isbn: string) => void
}

export function ScannerView({ onScan }: ScannerViewProps) {
 const [permissionState, setPermissionState] = useState<'requesting' | 'granted' | 'denied'>('requesting')
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan
  const hasScannedRef = useRef(false)

useEffect(() => {
  hasScannedRef.current = false
  let isUnmounted = false

  const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
    formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
    verbose: false,
  })

  scanner
    .start(
      { facingMode: 'environment' },
      { fps: 10 },
      (decodedText) => {
        if (hasScannedRef.current) return
        hasScannedRef.current = true
        onScanRef.current(decodedText)
        try {
          scanner.stop().catch(() => {})
        } catch {}
      },
      () => {}
    )
    .then(() => {
      if (isUnmounted) {
        // Cleanup already fired before start() finished — this instance
        // is orphaned. Stop it now instead of letting it keep running
        // alongside whatever instance replaced it.
        scanner.stop().then(() => scanner.clear()).catch(() => {})
      } else {
        setPermissionState('granted')
      }
    })
    .catch(() => {
      if (!isUnmounted) setPermissionState('denied')
    })

  return () => {
    isUnmounted = true
    if (scanner.isScanning) {
      scanner.stop().then(() => scanner.clear()).catch(() => {})
    }
  }
}, [])

return (
  <div>
    <div className="scanner-frame">
      <div id={SCANNER_ELEMENT_ID} className="scanner-viewport" aria-label="Camera viewfinder for scanning a book's ISBN barcode" />
      {permissionState === 'granted' && (
        <div className="scanner-guide" aria-hidden="true">
          <span className="corner tl" /><span className="corner tr" />
          <span className="corner bl" /><span className="corner br" />
          <span className="scan-line" />
        </div>
      )}
    </div>

    <p className="caption mt-3" style={{ maxWidth: 340 }}>
      Aim at the black-and-white striped barcode itself — not the printed
      digits below it. Some books show two barcodes side by side; use the
      larger one, the small one is just a price add-on code.
    </p>

    {permissionState === 'requesting' && <p className="caption mt-3">Requesting camera access…</p>}
    {permissionState === 'denied' && (
      <p className="caption mt-3" style={{ color: 'var(--color-terracotta-deep)' }}>
        Camera access was denied. Check your browser's site permissions, or{' '}
        <a href="/admin/books/new" className="underline">switch to manual entry</a>.
      </p>
    )}
  </div>
)
}