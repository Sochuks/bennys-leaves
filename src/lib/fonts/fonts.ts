import { Outfit } from 'next/font/google'

export const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans-loaded',
})

// Young Serif isn't in next/font/google's curated set as of this writing —
// keep the Google Fonts <link> for it in layout.tsx, drop the Outfit one.