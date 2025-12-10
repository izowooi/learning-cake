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
  title: 'Learning Cake - 영어 학습 웹앱',
  description: '읽기, 듣기, 단어, 문제, 쓰기를 통한 영어 학습',
  openGraph: {
    title: 'Learning Cake - AI 맞춤형 영어 학습',
    description: 'AI가 생성한 맞춤형 지문으로 읽기, 듣기, 단어, 문제, 쓰기까지 한 번에 학습하세요.',
    siteName: 'Learning Cake',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Learning Cake - AI 맞춤형 영어 학습',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learning Cake - AI 맞춤형 영어 학습',
    description: 'AI가 생성한 맞춤형 지문으로 읽기, 듣기, 단어, 문제, 쓰기까지 한 번에 학습하세요.',
    images: ['/og-image.png'],
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
