import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Jeopardy Game',
  description: 'A Jeopardy-style trivia game',
  icons: {
    icon: '/lenny.png',
    apple: '/lenny.png',
  },
  openGraph: {
    title: 'Jeopardy Game',
    description: 'A Jeopardy-style trivia game',
    images: [
      {
        url: '/lenny.png',
        width: 1200,
        height: 630,
        alt: 'Jeopardy Game',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jeopardy Game',
    description: 'A Jeopardy-style trivia game',
    images: ['/lenny.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
