import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Learning Cake - 중국어 학습 웹앱',
  description: '읽기, 듣기, 단어, 문제, 쓰기를 통한 중국어 학습',
  openGraph: {
    title: 'Learning Cake - 중국어 학습 웹앱',
    description: '읽기, 듣기, 단어, 문제, 쓰기를 통한 중국어 학습',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className={outfit.variable}>
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
