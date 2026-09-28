import type { Metadata } from 'next'
import { outfit } from '@/lib/fonts/fonts'
import { Toaster } from '@/components/ui/Toaster'
import './globals.css'

export const metadata: Metadata = {
  title: "Benny's Leaves",
  description: 'Benny’s Leaves — books worth keeping.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Young+Serif&display=swap"
          rel="stylesheet"
        />
      </head>

      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  )
}