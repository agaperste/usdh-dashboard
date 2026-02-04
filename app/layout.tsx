import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'USDH Daily Usage Dashboard',
  description: 'Track USDH usage across HyperEVM and HyperCore ecosystems',
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
