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
    default: 'AI Digital Product Strategist | Product Strategy & Technical Execution',
    template: '%s | AI Digital Product Strategist',
  },
  description:
    'AI product strategy, system architecture and full-stack technical execution for useful digital products in complex and regulated markets.',
  keywords: [
    'digital product strategist',
    'product development',
    'AI product development',
    'system architecture',
    'full-stack development',
    'RegTech',
    'Nigeria',
    'Africa',
  ],
  authors: [{ name: 'AI Digital Product Strategist' }],
  openGraph: {
    title: 'AI Digital Product Strategist',
    description:
      'AI product strategy, system architecture and full-stack execution for useful digital products.',
    url: 'https://aidigitalproductstrategist.com',
    siteName: 'AI Digital Product Strategist',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Digital Product Strategist',
    description:
      'AI product strategy, system architecture and full-stack execution for useful digital products.',
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
