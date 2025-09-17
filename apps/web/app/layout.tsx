import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ClientProviders } from '@/components/providers/ClientProviders'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DAMOCLES - Debt Protection Platform',
  description: 'Decentralized Automated Debt Protection using GDPR and blockchain technology',
  keywords: 'debt protection, GDPR, consumer rights, Norway, blockchain',
  authors: [{ name: 'DAMOCLES DAO' }],
  openGraph: {
    title: 'DAMOCLES - Every User Protected',
    description: 'Transform individual vulnerability into collective strength',
    type: 'website',
    locale: 'nb_NO',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="no">
      <body className={`${inter.className} antialiased bg-slate-50`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}