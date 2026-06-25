import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Digital Product Strategist — Build · Strategy · Launch',
  description: 'End-to-end product builds, brand strategy, and content systems — for founders and businesses who demand the highest standard of work.',
  openGraph: {
    title: 'AI Digital Product Strategist',
    description: 'End-to-end product builds, brand strategy, and content systems.',
    url: 'https://aidigitalproductstrategist.com',
    siteName: 'AI Digital Product Strategist',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Digital Product Strategist',
    description: 'End-to-end product builds, brand strategy, and content systems.',
  },
  metadataBase: new URL('https://aidigitalproductstrategist.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
