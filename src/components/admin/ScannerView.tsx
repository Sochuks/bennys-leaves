'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'

const SCANNER_ELEMENT_ID = 'isbn-scanner-viewport'

type ScannerViewProps = {
  onScan: (isbn: string) => void
}

export function ScannerView({ onScan }: ScannerViewProps) {
  const [permissionState, setPermissionState] = useState<'requesting' | 'granted' | 'denied'>('requesting')

  // A ref, not a dependency: this always points at the latest `onScan`
  // without needing to appear in the effect's dependency array below.
  // If it WERE a dependency, the camera would stop and restart every time
  // the parent re-renders and hands down a new function reference —
  // exactly the kind of bug that's invisible until you notice the
  // viewfinder flickering.
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  useEffect(() => {
    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
      // ISBNs are always EAN-13 barcodes. Restricting to just that format
      // (instead of the library's default, which checks for QR codes and
      // half a dozen other barcode types every frame) makes detection
      // both faster and less likely to misfire on the wrong pattern.
      formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
      verbose: false,
    })

    scanner
      .start(
        { facingMode: 'environment' }, // the back camera, not the selfie camera
        { fps: 10, qrbox: { width: 260, height: 140 } },
        (decodedText) => {
          onScanRef.current(decodedText)
          scanner.stop().catch(() => {})
        },
        () => {
          // Fires continuously whenever a frame has no readable barcode —
          // that's the normal state while you're aiming the camera, not
          // an error worth showing anyone.
        }
      )
      .then(() => setPermissionState('granted'))
      .catch(() => setPermissionState('denied'))

    return () => {
      // React 18/19 Strict Mode runs effects twice in development
      // (mount → cleanup → mount) specifically to surface bugs like a
      // missing cleanup function. scanner.start() is async, so cleanup
      // can fire before it resolves — checking isScanning first avoids
      // calling stop() on a camera that never finished starting, which
      // would otherwise throw.
      if (scanner.isScanning) {
        scanner.stop().then(() => scanner.clear()).catch(() => {})
      }
    }
  }, [])

  return (
    <div>
      <div
        id={SCANNER_ELEMENT_ID}
        className="scanner-viewport"
        aria-label="Camera viewfinder for scanning a book's ISBN barcode"
      />
      {permissionState === 'requesting' && (
        <p className="caption mt-3">Requesting camera access…</p>
      )}
      {permissionState === 'denied' && (
        <p className="caption mt-3" style={{ color: 'var(--color-terracotta-deep)' }}>
          Camera access was denied. Check your browser's site permissions, or{' '}
          <a href="/admin/books/new" className="underline">switch to manual entry</a>.
        </p>
      )}
    </div>
  )
}