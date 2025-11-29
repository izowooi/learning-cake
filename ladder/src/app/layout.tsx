import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '사다리타기 | Ladder Game',
  description: '랜덤 사다리타기 게임으로 공정하게 결과를 정해보세요!',
  keywords: ['사다리타기', '사다리게임', '추첨', '랜덤', 'ladder game'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
