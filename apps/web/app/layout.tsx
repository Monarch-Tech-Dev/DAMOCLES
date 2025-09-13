import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'react-hot-toast'

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
      <body className={`${inter.className} antialiased bg-damocles-gray-50`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f9fafb',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f9fafb',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}