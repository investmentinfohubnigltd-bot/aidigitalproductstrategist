import type { Metadata } from 'next'
import { Fraunces, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

// Display serif — Fraunces carries the editorial, luxury character of the brand.
const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  style: ['normal', 'italic'],
  variable: '--font-serif',
})

// Body sans — Inter, the existing workhorse.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: 'ADPS — AI Digital Product Strategist',
    template: '%s · ADPS',
  },
  description:
    'AI product strategy, system architecture and end-to-end development for useful digital products across African and global markets.',
  keywords: [
    'digital product strategist',
    'product development',
    'brand strategy',
    'MVP development',
    'Nigeria',
    'Africa',
  ],
  authors: [{ name: 'AI Digital Product Strategist' }],
  openGraph: {
    title: 'ADPS — AI Digital Product Strategist',
    description:
      'An independent product practice combining strategy, system architecture, AI and full-stack execution.',
    url: 'https://aidigitalproductstrategist.com',
    siteName: 'ADPS',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ADPS — AI Digital Product Strategist',
    description:
      'An independent product practice combining strategy, system architecture, AI and full-stack execution.',
  },
  metadataBase: new URL('https://aidigitalproductstrategist.com'),
  alternates: { canonical: '/' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
