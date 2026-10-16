'use client'

import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode'
import { isValidIsbn13 } from '@/lib/isbn'

const SCANNER_ELEMENT_ID = 'isbn-scanner-viewport'
const REQUIRED_CONFIRMATIONS = 3
const CONFIRMATION_WINDOW_MS = 2000

type ScannerViewProps = {
  onScan: (isbn: string) => void
}

type Candidate = { code: string; count: number; startedAt: number }

export function ScannerView({ onScan }: ScannerViewProps) {
  const [permissionState, setPermissionState] = useState<'requesting' | 'granted' | 'denied'>('requesting')
  const [isLocking, setIsLocking] = useState(false)
  const onScanRef = useRef(onScan)
  onScanRef.current = onScan

  useEffect(() => {
    let scanner: Html5Qrcode | null = null
    let isCancelled = false
    let hasFinished = false
    let candidate: Candidate | null = null

    // Stop the camera FIRST, then tell the parent. If the parent unmounts this
    // component while stop() is still running, the <video> element is torn out
    // of the page mid-shutdown, which is a source of the play() AbortError.
    async function finish(code: string, active: Html5Qrcode) {
      try {
        await active.stop()
        active.clear()
      } catch {
        // Already stopping; nothing left to clean up.
      }
      if (!isCancelled) onScanRef.current(code)
    }

    function handleDecode(decodedText: string) {
      if (hasFinished) return

      // Not an ISBN (price sticker, store label, UPC, a corrupted read):
      // ignore it and keep looking.
      if (!isValidIsbn13(decodedText)) {
        candidate = null
        setIsLocking(false)
        return
      }

      // Require the same code several times in a short window before trusting it.
      const now = Date.now()
      let current: Candidate
      if (candidate && candidate.code === decodedText && now - candidate.startedAt <= CONFIRMATION_WINDOW_MS) {
        current = { ...candidate, count: candidate.count + 1 }
      } else {
        current = { code: decodedText, count: 1, startedAt: now }
        setIsLocking(true)
      }
      candidate = current

      if (current.count < REQUIRED_CONFIRMATIONS || !scanner) return

      hasFinished = true
      void finish(decodedText, scanner)
    }

    // Runs on every frame with no readable barcode. If we were "locking" onto
    // a code and it has been out of view too long, reset the hint.
    function handleMiss() {
      if (candidate && Date.now() - candidate.startedAt > CONFIRMATION_WINDOW_MS) {
        candidate = null
        setIsLocking(false)
      }
    }

    // Deferred by one tick on purpose. In development, React Strict Mode mounts
    // this component, immediately unmounts it, then mounts it again. Starting
    // the camera synchronously meant the first, doomed instance was mid-startup
    // when its video element got replaced. With a deferred start, the first
    // mount's cleanup cancels the timer before anything begins.
    const startTimer = window.setTimeout(() => {
      const instance = new Html5Qrcode(SCANNER_ELEMENT_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.EAN_13],
        verbose: false,
      })
      scanner = instance

      instance
        .start({ facingMode: 'environment' }, { fps: 10 }, handleDecode, handleMiss)
        .then(() => {
          if (isCancelled) {
            instance.stop().then(() => instance.clear()).catch(() => {})
            return
          }
          setPermissionState('granted')
        })
        .catch(() => {
          if (!isCancelled) setPermissionState('denied')
        })
    }, 0)

    return () => {
      isCancelled = true
      window.clearTimeout(startTimer)
      if (scanner?.isScanning) {
        const active = scanner
        active.stop().then(() => active.clear()).catch(() => {})
      }
    }
  }, [])

  return (
    <div>
      <div className="scanner-frame">
        <div
          id={SCANNER_ELEMENT_ID}
          className="scanner-viewport"
          aria-label="Camera viewfinder for scanning a book's ISBN barcode"
        />
        {permissionState === 'granted' && (
          <div className="scanner-guide" aria-hidden="true">
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
            <span className="scan-line" />
          </div>
        )}
      </div>

      <p className="caption mt-3" style={{ maxWidth: 340 }}>
        {isLocking
          ? 'Hold steady — confirming the barcode…'
          : 'Aim at the striped barcode, not the printed digits. Only ISBN barcodes (starting 978 or 979) are accepted; price stickers and other codes are ignored. If two barcodes sit side by side, use the larger one.'}
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