import './globals.css'

export const metadata = {
  title: 'CASH Token Analytics Dashboard',
  description: 'Comprehensive analysis of Phantom CASH token on Solana',
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
