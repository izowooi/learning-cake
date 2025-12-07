import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ganttly - 팀 일정 관리',
  description: '팀원들의 업무 일정을 시각화하여 관리하세요',
  openGraph: {
    title: 'Ganttly - 팀 일정 관리',
    description: '팀원들의 업무 일정을 시각화하여 관리하세요',
    siteName: 'Ganttly',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ganttly - 팀 일정 관리',
    description: '팀원들의 업무 일정을 시각화하여 관리하세요',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
