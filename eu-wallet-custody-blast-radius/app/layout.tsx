import './globals.css'

export const metadata = {
  title: 'EU Wallet Custody Blast Radius',
  description: 'Impact analysis of EU custody disruption on Bridge wallets',
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
