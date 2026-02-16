import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TruthOS Meeting Intelligence',
  description: 'Contact-centric meeting analysis with AI-powered insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
